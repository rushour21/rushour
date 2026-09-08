/**
 * Success metrics (§01).
 *
 * Pure, like the rest of the engine: every figure the dashboard shows must be
 * traceable to something the user entered, and reproducible on demand.
 *
 * The north star is plan-completion with ambition held constant, so the
 * counter-metrics ship alongside it - a completion rate that rose because the
 * user quietly stopped planning anything is a failure wearing a success's
 * clothes, and only the counter-metrics reveal that.
 */

export interface DayRecord {
  localDate: string;
  sealed: boolean;
  plannedMin: number;
  doneMin: number;
  plannedTasks: number;
  completedTasks: number;
  readinessScore: number | null;
  reasons: string[];
  /** Tasks by the tier they actually reached. Drives progression (progress.ts). */
  tiers?: { minimum: number; target: number; stretch: number };
}

export interface SuccessMetrics {
  /** Sealed days in the window. Everything below is computed from these only. */
  sealedDays: number;
  windowDays: number;

  /** North star: completed tasks / planned tasks. Null with nothing planned. */
  completionRate: number | null;
  /** Days where at least 70% of the plan was completed. */
  onPlanDays: number;

  plannedMin: number;
  doneMin: number;

  /** Counter-metric: is ambition being quietly reduced to flatter the rate? */
  avgTasksPlanned: number | null;
  avgTasksCompleted: number | null;
  ambitionTrend: "steady" | "shrinking" | "growing" | null;

  avgReadiness: number | null;
  reasonHistogram: Record<string, number>;

  /** Consistency without a streak: days shown up, out of days available. */
  showUpRate: number | null;
}

export const ON_PLAN_THRESHOLD = 0.7;
/** Below this many sealed days, rates are too noisy to state. */
export const MIN_DAYS_FOR_RATE = 3;

export function successMetrics(days: DayRecord[]): SuccessMetrics {
  const windowDays = days.length;
  const sealed = days.filter((d) => d.sealed);
  const sealedDays = sealed.length;

  const plannedTasks = sum(sealed.map((d) => d.plannedTasks));
  const completedTasks = sum(sealed.map((d) => d.completedTasks));
  const plannedMin = sum(sealed.map((d) => d.plannedMin));
  const doneMin = sum(sealed.map((d) => d.doneMin));

  const reasonHistogram: Record<string, number> = {};
  for (const d of sealed) {
    for (const r of d.reasons) reasonHistogram[r] = (reasonHistogram[r] ?? 0) + 1;
  }

  const readings = sealed
    .map((d) => d.readinessScore)
    .filter((s): s is number => s !== null);

  const onPlanDays = sealed.filter(
    (d) => d.plannedTasks > 0 && d.completedTasks / d.plannedTasks >= ON_PLAN_THRESHOLD,
  ).length;

  return {
    sealedDays,
    windowDays,
    completionRate: plannedTasks > 0 ? completedTasks / plannedTasks : null,
    onPlanDays,
    plannedMin,
    doneMin,
    avgTasksPlanned: sealedDays > 0 ? round1(plannedTasks / sealedDays) : null,
    avgTasksCompleted: sealedDays > 0 ? round1(completedTasks / sealedDays) : null,
    ambitionTrend: ambitionTrend(sealed),
    avgReadiness: readings.length > 0 ? Math.round(mean(readings)) : null,
    reasonHistogram,
    showUpRate: windowDays > 0 ? sealedDays / windowDays : null,
  };
}

/**
 * Compares planned volume in the recent half of the window against the earlier
 * half. Guards the north star: a rising completion rate on shrinking ambition
 * is not progress.
 */
function ambitionTrend(sealed: DayRecord[]): SuccessMetrics["ambitionTrend"] {
  if (sealed.length < 4) return null;

  const mid = Math.floor(sealed.length / 2);
  const earlier = mean(sealed.slice(0, mid).map((d) => d.plannedTasks));
  const recent = mean(sealed.slice(mid).map((d) => d.plannedTasks));
  if (earlier === 0) return null;

  const change = (recent - earlier) / earlier;
  if (change < -0.2) return "shrinking";
  if (change > 0.2) return "growing";
  return "steady";
}

/** Whether a rate has enough evidence behind it to be worth stating. */
export function hasEnoughEvidence(sealedDays: number): boolean {
  return sealedDays >= MIN_DAYS_FOR_RATE;
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : sum(xs) / xs.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
