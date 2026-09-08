import { connectDb } from "@/lib/db/client";
import { NodeModel, SessionModel } from "@/lib/db/models";
import { calibrate } from "@/lib/engine/calibration";
import {
  achievements,
  levelFor,
  streak,
  successMetrics,
  totalXp,
  type DayRecord,
} from "@/lib/engine";
import { addDays, sessionDate } from "@/lib/time";
import type { Ctx } from "./context";

export const WINDOW_DAYS = 14;

export interface DashboardData {
  days: DayRecord[];
  metrics: ReturnType<typeof successMetrics>;
  calibration: ReturnType<typeof calibrate>;
  streak: ReturnType<typeof streak>;
  level: ReturnType<typeof levelFor>;
  achievements: ReturnType<typeof achievements>;
  activeGoals: { id: string; title: string; category: string }[];
  laterCount: number;
  today: {
    localDate: string;
    state: "NONE" | "OPEN" | "PLANNING" | "CLOSED" | "AUTO_CLOSED";
    outcome: string;
  };
}

/**
 * Everything the dashboard shows, in one pass.
 *
 * Days with no session are included as unsealed records rather than omitted:
 * the gaps are part of the picture, and dropping them would quietly inflate
 * every rate computed over the window.
 */
export async function dashboardData(ctx: Ctx): Promise<DashboardData> {
  await connectDb();

  const today = sessionDate(ctx.user.timezone);
  const from = addDays(today, -(WINDOW_DAYS - 1));
  const dates = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(from, i));

  const sessions = await SessionModel.find({
    userId: ctx.userId,
    localDate: { $in: dates },
  }).lean();

  const byDate = new Map<string, RawSession>();
  for (const s of sessions as unknown as RawSession[]) byDate.set(s.localDate, s);

  const days: DayRecord[] = dates.map((localDate) => {
    const s = byDate.get(localDate);
    const sealed = s?.state === "CLOSED" && s.reviewed === true;

    if (!s || !sealed) {
      return {
        localDate,
        sealed: false,
        plannedMin: 0,
        doneMin: 0,
        plannedTasks: 0,
        completedTasks: 0,
        readinessScore: s?.readiness?.score ?? null,
        reasons: [],
      };
    }

    const items = s.plan?.items ?? [];
    const actuals = s.actuals ?? [];

    return {
      localDate,
      sealed: true,
      plannedMin: items.reduce((n, i) => n + i.estimateTarget, 0),
      doneMin: actuals.reduce((n, a) => n + a.actualMin, 0),
      plannedTasks: items.length,
      completedTasks: actuals.filter((a) => a.tierReached !== "none").length,
      readinessScore: s.readiness?.score ?? null,
      reasons: actuals.map((a) => a.reason).filter((r): r is string => Boolean(r)),
      tiers: {
        minimum: actuals.filter((a) => a.tierReached === "minimum").length,
        target: actuals.filter((a) => a.tierReached === "target").length,
        stretch: actuals.filter((a) => a.tierReached === "stretch").length,
      },
    };
  });

  const observations: { estimateTargetMin: number; actualMin: number; suspect?: boolean }[] = [];
  for (const s of sessions as unknown as RawSession[]) {
    if (s.state !== "CLOSED" || !s.reviewed) continue;
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

  const goals = await NodeModel.find({ userId: ctx.userId, type: "year" })
    .select("_id title category status")
    .lean();
  const goalDocs = goals as unknown as {
    _id: unknown;
    title: string;
    category: string;
    status: string;
  }[];

  const current = byDate.get(today);

  const calibration = calibrate(observations);
  const activeGoals = goalDocs.filter((g) => g.status === "active");
  const laterCount = goalDocs.filter(
    (g) => g.status === "later" || g.status === "parked",
  ).length;

  return {
    days,
    metrics: successMetrics(days),
    calibration,
    streak: streak(days),
    level: levelFor(totalXp(days)),
    achievements: achievements({
      days,
      calibrationN: calibration.n,
      activeGoals: activeGoals.length,
      laterGoals: laterCount,
    }),
    activeGoals: goalDocs
      .filter((g) => g.status === "active")
      .map((g) => ({ id: String(g._id), title: g.title, category: g.category })),
    laterCount,
    today: {
      localDate: today,
      state: !current
        ? "NONE"
        : current.state === "OPEN" && !current.plan?.committedAt
          ? "PLANNING"
          : (current.state as "OPEN" | "CLOSED" | "AUTO_CLOSED"),
      outcome: current?.plan?.outcome ?? "",
    },
  };
}

interface RawSession {
  localDate: string;
  state: string;
  reviewed?: boolean;
  readiness?: { score?: number };
  plan?: { outcome?: string; committedAt?: Date | null; items?: { nodeId: unknown; estimateTarget: number }[] };
  actuals?: { nodeId: unknown; actualMin: number; tierReached: string; reason: string | null }[];
  segments?: { suspect?: boolean }[];
}
