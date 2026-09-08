"use server";

import { connectDb } from "@/lib/db/client";
import { Review, SessionModel, User } from "@/lib/db/models";
import { adapt, dominantReason } from "@/lib/engine";
import { weeklyNarrative, type WeeklyStats } from "@/lib/ai/sites";
import { isoWeek, weekDates } from "@/lib/time";
import { requireUser } from "./context";

/**
 * Weekly review (REQ-070) and load adaptation (REQ-072).
 *
 * Auto-closed sessions are excluded: an unreviewed day is not evidence about
 * how much the person can do.
 */
export async function buildWeeklyReview(anchorDate: string) {
  const ctx = await requireUser();
  await connectDb();

  const dates = weekDates(anchorDate);
  const sessions = await SessionModel.find({
    userId: ctx.userId,
    localDate: { $in: dates },
    state: "CLOSED",
    reviewed: true,
  }).lean();

  let plannedMin = 0;
  let completedMin = 0;
  let plannedTasks = 0;
  let completedTasks = 0;
  const reasonHistogram: Record<string, number> = {};

  for (const s of sessions as unknown as {
    plan?: { items?: { nodeId: unknown; estimateTarget: number }[] };
    actuals?: { nodeId: unknown; actualMin: number; tierReached: string; reason: string | null }[];
  }[]) {
    for (const item of s.plan?.items ?? []) {
      plannedMin += item.estimateTarget;
      plannedTasks += 1;
    }
    for (const a of s.actuals ?? []) {
      completedMin += a.actualMin;
      if (a.tierReached !== "none") completedTasks += 1;
      if (a.reason) reasonHistogram[a.reason] = (reasonHistogram[a.reason] ?? 0) + 1;
    }
  }

  const completionRate = plannedTasks > 0 ? completedTasks / plannedTasks : 0;
  const dominant = dominantReason(reasonHistogram);
  const adaptation = adapt(
    ctx.user.planning.utilization,
    completionRate,
    sessions.length,
  );

  const stats: WeeklyStats = {
    sessions: sessions.length,
    plannedMin,
    completedMin,
    completionRate: Math.round(completionRate * 100) / 100,
    plannedTasks,
    completedTasks,
    dominantPattern: dominant?.reason ?? null,
    dominantCount: dominant?.count ?? 0,
    multiplierBefore: ctx.user.planning.multiplier,
    multiplierAfter: ctx.user.planning.multiplier,
    utilizationBefore: ctx.user.planning.utilization,
    utilizationAfter: adaptation.utilization,
  };

  // Below three sealed sessions there is nothing to diagnose: show the numbers.
  const narrative = sessions.length >= 3 ? await weeklyNarrative(stats) : null;

  await Review.updateOne(
    { userId: ctx.userId, isoWeek: isoWeek(anchorDate) },
    {
      $set: {
        userId: ctx.userId,
        isoWeek: isoWeek(anchorDate),
        stats: { ...stats, reasonHistogram },
        narrative,
      },
    },
    { upsert: true },
  );

  return { stats, reasonHistogram, adaptation, narrative, sessionCount: sessions.length };
}

/** Applying the adaptation is a separate, announced step - never silent. */
export async function applyAdaptation(utilization: number): Promise<void> {
  const ctx = await requireUser();
  await connectDb();
  await User.updateOne(
    { _id: ctx.userId },
    { $set: { "planning.utilization": utilization } },
  );
}
