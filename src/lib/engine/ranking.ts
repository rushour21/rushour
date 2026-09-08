import type { PlanItem, ReadinessBand } from "./types";

/**
 * "What should I do right now" (§06.5, REQ-040).
 *
 * Deterministic on purpose. The same inputs must always produce the same
 * recommendation, and the reason it won is always shown — a recommendation the
 * user cannot interrogate is one they stop following.
 */

export interface RankContext {
  /** Minutes left in the current block or session. */
  blockRemainingMin: number;
  multiplier: number;
  band: ReadinessBand;
  /** Goal of the task the user was last working on: switching costs something. */
  currentGoalId?: string | null;
  now?: Date;
}

export interface Ranked {
  item: PlanItem;
  score: number;
  fits: boolean;
  adjustedMin: number;
  reason: string;
}

const W = {
  goal: 0.3,
  due: 0.25,
  fit: 0.2,
  energy: 0.15,
  switch: 0.1,
};

export function rank(items: PlanItem[], ctx: RankContext): Ranked[] {
  const now = ctx.now ?? new Date();

  return items
    .map((item) => {
      const adjustedMin = Math.round(item.estimateMin.target * ctx.multiplier);
      const fits = adjustedMin <= ctx.blockRemainingMin;

      const goalScore = (item.weight ?? 3) / 5;
      const daysUntilDue = item.dueAt
        ? Math.max(0, (item.dueAt.getTime() - now.getTime()) / 86_400_000)
        : 30;
      const dueScore = 1 / (daysUntilDue + 1);
      const fitScore = fits ? 1 : 0.2;
      const energyScore = energyFit(adjustedMin, ctx.band);
      const switchPenalty =
        ctx.currentGoalId && item.goalId && item.goalId !== ctx.currentGoalId ? 1 : 0;

      const score =
        W.goal * goalScore +
        W.due * dueScore +
        W.fit * fitScore +
        W.energy * energyScore -
        W.switch * switchPenalty;

      return {
        item,
        score: Math.round(score * 1000) / 1000,
        fits,
        adjustedMin,
        reason: explain({ fits, adjustedMin, daysUntilDue, blockRemainingMin: ctx.blockRemainingMin }),
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Long tasks score badly on a low-readiness day; short ones score badly on a
 * high-readiness day, because a HIGH morning is the wrong place to do admin.
 */
function energyFit(adjustedMin: number, band: ReadinessBand): number {
  const deep = adjustedMin >= 60;
  if (band === "HIGH") return deep ? 1 : 0.6;
  if (band === "MEDIUM") return deep ? 0.7 : 0.9;
  return deep ? 0.2 : 1;
}

function explain(a: {
  fits: boolean;
  adjustedMin: number;
  daysUntilDue: number;
  blockRemainingMin: number;
}): string {
  const parts: string[] = [];
  parts.push(
    a.fits
      ? `fits your remaining ${Math.round(a.blockRemainingMin)} min`
      : `needs ${a.adjustedMin} min — more than you have left`,
  );
  if (a.daysUntilDue <= 1) parts.push("due today");
  else if (a.daysUntilDue < 7) parts.push(`due in ${Math.ceil(a.daysUntilDue)} days`);
  return parts.join("; ");
}
