"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDb } from "@/lib/db/client";
import { NodeModel, SessionModel, User } from "@/lib/db/models";
import { capacity, readiness, type PlanItem } from "@/lib/engine";
import { calibrate } from "@/lib/engine/calibration";
import { addDays, daysBetween, sessionDate } from "@/lib/time";
import {
  MAX_SESSION_WINDOW_MIN,
  REENTRY_CEILING,
  REENTRY_GAP_DAYS,
  SUSPECT_SEGMENT_MIN,
} from "@/lib/limits";
import { requireUser, type Ctx } from "./context";

export type SessionState = { error?: string; ok?: boolean } | undefined;

const clockInSchema = z.object({
  sleepHours: z.coerce.number().min(0).max(16),
  energy: z.coerce.number().int().min(1).max(5),
  stress: z.coerce.number().int().min(1).max(5),
  /** "17:30" local. */
  plannedClockOut: z.string().regex(/^\d{2}:\d{2}$/),
});

/**
 * Clock in (REQ-020).
 *
 * Opens the day. The three readiness inputs set the day's load ceiling, and the
 * window from now until the planned clock-out becomes the capacity denominator -
 * an observed window rather than a self-reported estimate.
 */
export async function clockIn(_prev: SessionState, formData: FormData): Promise<SessionState> {
  const ctx = await requireUser();
  const parsed = clockInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDb();

  const now = new Date();
  const date = sessionDate(ctx.user.timezone, now);

  const open = await SessionModel.findOne({ userId: ctx.userId, state: "OPEN" });
  if (open) return { error: "You are already clocked in." };

  const existing = await SessionModel.findOne({ userId: ctx.userId, localDate: date });
  if (existing) {
    // Resume rather than start a second day (REQ-024).
    existing.state = "OPEN";
    existing.clockOutAt = null;
    existing.closedBy = null;
    await existing.save();
    revalidatePath("/today");
    return { ok: true };
  }

  const plannedOut = resolvePlannedOut(parsed.data.plannedClockOut, now);
  const windowMin = Math.max(30, Math.round((plannedOut.getTime() - now.getTime()) / 60_000));

  const yesterdayLoad = await previousDayLoad(ctx.userId, date);
  const r = readiness({
    sleepHours: parsed.data.sleepHours,
    sleepTargetHours: ctx.user.profile.sleepTargetH,
    energy: parsed.data.energy,
    stress: parsed.data.stress,
    yesterdayLoad,
    weights: ctx.user.readinessWeights,
  });

  const reentry = await isReentry(ctx.userId, date);
  const utilization = ctx.user.planning.utilization * (reentry ? REENTRY_CEILING : 1);

  // The window between clocking in and the planned clock-out is time the user
  // has declared available, so nothing is subtracted from it here.
  //
  // Prorating the profile's daily commitments into the window double-counts:
  // someone clocking in at 22:00 has already had their work, commute and meals,
  // and charging a slice of all 13 hours against a 3 hour evening leaves them
  // 14 plannable minutes - arithmetic that is defensible and useless.
  //
  // The profile's fixed hours still govern the weekly check, where prorating is
  // correct. This field stays in the model for calendar integration, which will
  // populate it with committed blocks that genuinely overlap the window.
  const fixedMin = 0;

  const v = capacity({
    windowMin,
    fixedMin,
    items: [],
    multiplier: ctx.user.planning.multiplier,
    utilization,
    band: r.band,
  });

  await SessionModel.create({
    userId: ctx.userId,
    localDate: date,
    state: "OPEN",
    clockInAt: now,
    plannedClockOutAt: plannedOut,
    readiness: {
      sleepH: parsed.data.sleepHours,
      energy: parsed.data.energy,
      stress: parsed.data.stress,
      score: r.score,
      band: r.band,
    },
    capacity: {
      windowMin: v.windowMin,
      fixedMin: v.fixedMin,
      bufferMin: v.bufferMin,
      availableMin: v.availableMin,
      demandMin: 0,
      verdictMin: v.availableMin,
    },
    reentry,
  });

  revalidatePath("/today");
  return { ok: true };
}

const commitSchema = z.object({
  outcome: z.string().min(3).max(160),
  items: z
    .array(
      z.object({
        title: z.string().min(2).max(140),
        minimumMin: z.coerce.number().int().min(5).max(480),
        targetMin: z.coerce.number().int().min(5).max(600),
        stretchMin: z.coerce.number().int().min(5).max(720),
        goalId: z.string().optional().nullable(),
      }),
    )
    .min(1)
    .max(8),
});

/**
 * Commit the plan (REQ-032).
 *
 * The capacity check runs again here as the authority. The client already ran
 * the same engine function for the live preview, but a client result is a
 * preview and is never trusted.
 */
export async function commitPlan(payload: unknown): Promise<SessionState> {
  const ctx = await requireUser();
  const parsed = commitSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDb();
  const session = await SessionModel.findOne({ userId: ctx.userId, state: "OPEN" });
  if (!session) return { error: "You are not clocked in." };
  if (session.plan?.committedAt) return { error: "Today's plan is already committed." };

  const nodes = await Promise.all(
    parsed.data.items.map((item) =>
      NodeModel.create({
        userId: ctx.userId,
        type: "task",
        title: item.title,
        parentId: item.goalId || null,
        path: item.goalId ? [item.goalId] : [],
        estimateMin: {
          minimum: item.minimumMin,
          target: item.targetMin,
          stretch: item.stretchMin,
        },
      }),
    ),
  );

  const planItems: PlanItem[] = nodes.map((n) => ({
    nodeId: String(n._id),
    title: n.title,
    estimateMin: {
      minimum: n.estimateMin.minimum,
      target: n.estimateMin.target,
      stretch: n.estimateMin.stretch,
    },
  }));

  const remainingMin = Math.max(
    30,
    Math.round((session.plannedClockOutAt.getTime() - Date.now()) / 60_000),
  );

  const v = capacity({
    windowMin: remainingMin,
    fixedMin: session.capacity.fixedMin,
    items: planItems,
    multiplier: ctx.user.planning.multiplier,
    utilization: ctx.user.planning.utilization * (session.reentry ? REENTRY_CEILING : 1),
    band: session.readiness.band,
  });

  if (v.overloaded) {
    await NodeModel.deleteMany({ _id: { $in: nodes.map((n) => n._id) } });
    return {
      error: `That plan is ${Math.abs(v.verdictMin)} minutes more than today can hold. Cut something.`,
    };
  }

  session.plan = {
    outcome: parsed.data.outcome,
    outcomeNodeId: null,
    items: nodes.map((n) => ({
      nodeId: n._id,
      title: n.title,
      estimateTarget: n.estimateMin.target,
      estimateMinimum: n.estimateMin.minimum,
      weight: 3,
      goalId: n.parentId,
      dueAt: null,
    })),
    committedAt: new Date(),
  };
  session.capacity.demandMin = v.demandMin;
  session.capacity.verdictMin = v.verdictMin;
  await session.save();

  revalidatePath("/today");
  return { ok: true };
}

/** Start a task (REQ-021). Exactly one task may be active at a time. */
export async function startTask(nodeId: string): Promise<SessionState> {
  const ctx = await requireUser();
  await connectDb();

  const session = await SessionModel.findOne({ userId: ctx.userId, state: "OPEN" });
  if (!session) return { error: "You are not clocked in." };

  const now = new Date();
  let alreadyActive = false;

  for (const seg of session.segments) {
    if (seg.endedAt) continue;
    if (String(seg.nodeId) === nodeId) {
      alreadyActive = true;
      continue;
    }
    closeSegment(seg, now);
  }

  if (!alreadyActive) {
    session.segments.push({ nodeId, startedAt: now, endedAt: null, lastHeartbeat: now, suspect: false });
  }

  await session.save();
  revalidatePath("/today");
  return { ok: true };
}

export async function stopTask(): Promise<SessionState> {
  const ctx = await requireUser();
  await connectDb();

  const session = await SessionModel.findOne({ userId: ctx.userId, state: "OPEN" });
  if (!session) return { error: "You are not clocked in." };

  const now = new Date();
  for (const seg of session.segments) {
    if (!seg.endedAt) closeSegment(seg, now);
  }

  await session.save();
  revalidatePath("/today");
  return { ok: true };
}

const clockOutSchema = z.object({
  tomorrow: z.string().max(160).optional().default(""),
  actuals: z.array(
    z.object({
      nodeId: z.string(),
      actualMin: z.coerce.number().int().min(0).max(960),
      tierReached: z.enum(["none", "minimum", "target", "stretch"]),
      reason: z
        .enum([
          "overscheduled",
          "unexpected",
          "distracted",
          "low_energy",
          "underestimated",
          "blocked",
          "procrastinated",
        ])
        .nullable()
        .optional(),
    }),
  ),
});

/**
 * Clock out and seal (REQ-022).
 *
 * After this the plan, the actuals and the reasons are immutable, and
 * calibration recomputes. Sealing is what makes the plan-versus-actual gap
 * measurable at all.
 */
export async function clockOut(payload: unknown): Promise<SessionState> {
  const ctx = await requireUser();
  const parsed = clockOutSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDb();
  const session = await SessionModel.findOne({ userId: ctx.userId, state: "OPEN" });
  if (!session) return { error: "You are not clocked in." };

  const now = new Date();
  for (const seg of session.segments) {
    if (!seg.endedAt) closeSegment(seg, now);
  }

  session.actuals = parsed.data.actuals.map((a) => ({
    nodeId: a.nodeId,
    actualMin: a.actualMin,
    tierReached: a.tierReached,
    reason: a.reason ?? null,
  }));
  session.tomorrow = parsed.data.tomorrow ?? "";
  session.state = "CLOSED";
  session.closedBy = "user";
  session.clockOutAt = now;
  session.reviewed = true;
  await session.save();

  for (const a of parsed.data.actuals) {
    await NodeModel.updateOne(
      { _id: a.nodeId, userId: ctx.userId },
      {
        $set: {
          actualMin: a.actualMin,
          status: a.tierReached === "none" ? "active" : "done",
          completedAt: a.tierReached === "none" ? null : now,
        },
      },
    );
  }

  await recalibrate(ctx);

  revalidatePath("/today");
  revalidatePath("/review");
  return { ok: true };
}

/** Recompute the personal multiplier from sealed, non-suspect sessions (REQ-074). */
async function recalibrate(ctx: Ctx): Promise<void> {
  const sessions = await SessionModel.find({
    userId: ctx.userId,
    state: "CLOSED",
    reviewed: true,
  })
    .sort({ localDate: 1 })
    .limit(60)
    .lean();

  const observations: { estimateTargetMin: number; actualMin: number; suspect?: boolean }[] = [];

  for (const s of sessions as unknown as {
    plan: { items: { nodeId: unknown; estimateTarget: number }[] };
    actuals: { nodeId: unknown; actualMin: number; tierReached: string }[];
    segments: { suspect?: boolean }[];
  }[]) {
    const suspect = s.segments?.some((seg) => seg.suspect) ?? false;
    for (const item of s.plan?.items ?? []) {
      const actual = s.actuals?.find((a) => String(a.nodeId) === String(item.nodeId));
      if (!actual || actual.tierReached === "none" || actual.actualMin <= 0) continue;
      observations.push({
        estimateTargetMin: item.estimateTarget,
        actualMin: actual.actualMin,
        suspect,
      });
    }
  }

  const c = calibrate(observations);
  await User.updateOne(
    { _id: ctx.userId },
    { $set: { "planning.multiplier": c.multiplier, "planning.multiplierN": c.n } },
  );
}

/**
 * Resume after clock-out (REQ-024).
 *
 * Appends to the existing day rather than opening a second session, so split
 * shifts produce one record and the day is counted once. The sealed plan is
 * untouched; only new actuals attach to it.
 */
export async function resumeSession(): Promise<SessionState> {
  const ctx = await requireUser();
  await connectDb();

  const date = sessionDate(ctx.user.timezone);
  const session = await SessionModel.findOne({ userId: ctx.userId, localDate: date });
  if (!session) return { error: "There is no day to pick back up." };

  session.state = "OPEN";
  session.clockOutAt = null;
  session.closedBy = null;
  await session.save();

  revalidatePath("/today");
  return { ok: true };
}

/* ---------- helpers ---------- */

function closeSegment(
  seg: { startedAt: Date; endedAt: Date | null; lastHeartbeat?: Date | null; suspect?: boolean },
  now: Date,
): void {
  const anchor = seg.lastHeartbeat ?? seg.startedAt;
  const elapsedMin = (now.getTime() - seg.startedAt.getTime()) / 60_000;

  if (elapsedMin > SUSPECT_SEGMENT_MIN) {
    // A timer left running is not evidence of work. Truncate to the last sign
    // of life and exclude it from calibration.
    seg.endedAt = anchor;
    seg.suspect = true;
  } else {
    seg.endedAt = now;
  }
}

/**
 * A clock-out time that has already passed belongs to tomorrow - someone
 * clocking in at 01:00 and finishing at 09:00 means this morning.
 *
 * The result is then capped: no session is a 20-hour day, and an uncapped
 * instant would inflate the capacity denominator everywhere it is read, not
 * just where it is first computed. Clamping the instant rather than the derived
 * minute count keeps the client preview, the active screen and rescue in step.
 */
function resolvePlannedOut(hhmm: string, now: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const out = new Date(now);
  out.setHours(h, m, 0, 0);
  if (out.getTime() <= now.getTime()) out.setDate(out.getDate() + 1);

  const cap = now.getTime() + MAX_SESSION_WINDOW_MIN * 60_000;
  return out.getTime() > cap ? new Date(cap) : out;
}

async function previousDayLoad(userId: string, date: string): Promise<number | undefined> {
  const prev = await SessionModel.findOne({ userId, localDate: addDays(date, -1) }).lean();
  const s = prev as unknown as {
    capacity?: { availableMin?: number };
    actuals?: { actualMin: number }[];
  } | null;
  if (!s?.capacity?.availableMin) return undefined;

  const worked = (s.actuals ?? []).reduce((n, a) => n + a.actualMin, 0);
  return worked / s.capacity.availableMin;
}

/** Lapse re-entry (REQ-042): 3+ days away drops the first day's ceiling to 60%. */
async function isReentry(userId: string, date: string): Promise<boolean> {
  const last = await SessionModel.findOne({ userId })
    .sort({ localDate: -1 })
    .select("localDate")
    .lean();
  if (!last) return false;
  return daysBetween((last as unknown as { localDate: string }).localDate, date) >= REENTRY_GAP_DAYS;
}
