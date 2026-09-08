import type { DayRecord } from "./metrics";

/**
 * Streaks, levels and achievements (stages 3.5-3.7).
 *
 * Streaks are on the kill list for a good reason: a broken streak becomes a
 * reason to quit rather than a data point, which is the exact failure this
 * product exists to interrupt. So this is the version that keeps the pull and
 * removes the trap.
 *
 *   1. The streak counts SHOWING UP - clocking in and out - not finishing the
 *      plan. A day where little got done still counts, because the behaviour
 *      being reinforced is closing the loop honestly.
 *   2. Rest days are earned and banked. One missed day spends a rest day
 *      instead of resetting to zero, so a single bad Tuesday cannot undo a
 *      month.
 *
 * Everything here is derived from sealed sessions. Nothing is a separate
 * counter that could drift away from the record.
 */

/** Consecutive counted days that earn one rest day. */
export const DAYS_PER_REST = 5;
export const MAX_REST_BANKED = 2;

export interface Streak {
  current: number;
  best: number;
  /** Rest days available to absorb a future gap. */
  restBanked: number;
  /** Rest days spent keeping the current streak alive. */
  restUsed: number;
  /** True when the streak survived only because a rest day covered a gap. */
  protectedByRest: boolean;
}

/**
 * @param days chronological, oldest first, one record per calendar day
 *             including days with no session.
 */
export function streak(days: DayRecord[]): Streak {
  let current = 0;
  let best = 0;
  let banked = 0;
  let used = 0;
  let sinceLastRest = 0;
  let protectedByRest = false;

  for (const day of days) {
    if (day.sealed) {
      current += 1;
      sinceLastRest += 1;

      if (sinceLastRest >= DAYS_PER_REST) {
        banked = Math.min(MAX_REST_BANKED, banked + 1);
        sinceLastRest = 0;
      }
      best = Math.max(best, current);
      continue;
    }

    // A gap. Spend a rest day if one is banked; otherwise the streak ends.
    if (current > 0 && banked > 0) {
      banked -= 1;
      used += 1;
      protectedByRest = true;
    } else {
      current = 0;
      used = 0;
      sinceLastRest = 0;
      protectedByRest = false;
    }
  }

  return { current, best, restBanked: banked, restUsed: used, protectedByRest };
}

/* ---------- levels ---------- */

export const XP = {
  sealedDay: 10,
  minimum: 4,
  target: 8,
  stretch: 12,
  onPlanDay: 15,
} as const;

export interface Level {
  xp: number;
  level: number;
  /** XP earned inside the current level. */
  intoLevel: number;
  /** XP the current level costs in total. */
  levelSpan: number;
  toNext: number;
}

/** Each level costs a little more than the last: 100, 150, 200, ... */
export function levelCost(level: number): number {
  return 100 + (level - 1) * 50;
}

/**
 * Progress is earned for closing the day and for reaching the MINIMUM tier,
 * not only the target. A bad day executed honestly still advances you, which
 * is the whole point of having a minimum tier at all.
 */
export function totalXp(days: DayRecord[]): number {
  let xp = 0;
  for (const d of days) {
    if (!d.sealed) continue;
    xp += XP.sealedDay;
    xp += (d.tiers?.minimum ?? 0) * XP.minimum;
    xp += (d.tiers?.target ?? 0) * XP.target;
    xp += (d.tiers?.stretch ?? 0) * XP.stretch;
    if (d.plannedTasks > 0 && d.completedTasks / d.plannedTasks >= 0.7) {
      xp += XP.onPlanDay;
    }
  }
  return xp;
}

export function levelFor(xp: number): Level {
  let level = 1;
  let remaining = xp;

  while (remaining >= levelCost(level)) {
    remaining -= levelCost(level);
    level += 1;
  }

  const levelSpan = levelCost(level);
  return { xp, level, intoLevel: remaining, levelSpan, toNext: levelSpan - remaining };
}

/* ---------- achievements ---------- */

export interface Achievement {
  id: string;
  name: string;
  /** What behaviour this marks, and why that behaviour matters. */
  detail: string;
  earned: boolean;
  /** Progress toward earning it, when that can be shown honestly. */
  progress?: { have: number; need: number };
}

export interface AchievementInput {
  days: DayRecord[];
  calibrationN: number;
  activeGoals: number;
  laterGoals: number;
}

/**
 * Every badge marks a behaviour the product exists to cause. None of them
 * reward mere usage - opening the app, or a long streak for its own sake -
 * because a badge for showing up teaches showing up, not executing.
 */
export function achievements(input: AchievementInput): Achievement[] {
  const sealed = input.days.filter((d) => d.sealed);
  const onPlan = sealed.filter(
    (d) => d.plannedTasks > 0 && d.completedTasks / d.plannedTasks >= 0.7,
  ).length;

  const bestWeek = bestSealedWeek(input.days);

  // A low-readiness day where everything planned was finished, at any tier:
  // the minimum tier working exactly as designed.
  const salvaged = sealed.some(
    (d) =>
      d.readinessScore !== null &&
      d.readinessScore < 50 &&
      d.plannedTasks > 0 &&
      d.completedTasks === d.plannedTasks,
  );

  const cutSomething = input.laterGoals > 0 && input.activeGoals <= 2;

  return [
    {
      id: "closed-one",
      name: "Closed a day",
      detail: "Clocked in and clocked out. The loop only measures what it can close.",
      earned: sealed.length >= 1,
      progress: { have: Math.min(sealed.length, 1), need: 1 },
    },
    {
      id: "on-plan-three",
      name: "Three on plan",
      detail: "Three days finishing at least 70% of what you committed to.",
      earned: onPlan >= 3,
      progress: { have: Math.min(onPlan, 3), need: 3 },
    },
    {
      id: "honest-week",
      name: "A full week",
      detail: "Five closed days inside one week. Consistency, not intensity.",
      earned: bestWeek >= 5,
      progress: { have: Math.min(bestWeek, 5), need: 5 },
    },
    {
      id: "salvaged",
      name: "Bad day, still counted",
      detail:
        "Finished everything planned on a low-readiness day. The minimum tier doing its job.",
      earned: salvaged,
    },
    {
      id: "chose-two",
      name: "Chose two",
      detail: "Held to two active goals with something deliberately parked for later.",
      earned: cutSomething,
    },
    {
      id: "calibrated",
      name: "Calibrated",
      detail:
        "Twenty real estimates recorded. Your multiplier is now yours, not a borrowed average.",
      earned: input.calibrationN >= 20,
      progress: { have: Math.min(input.calibrationN, 20), need: 20 },
    },
  ];
}

/** Most sealed days inside any single rolling 7-day span. */
function bestSealedWeek(days: DayRecord[]): number {
  let best = 0;
  for (let i = 0; i < days.length; i++) {
    const window = days.slice(i, i + 7);
    best = Math.max(best, window.filter((d) => d.sealed).length);
  }
  return best;
}
