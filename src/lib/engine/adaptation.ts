/**
 * Weekly load adaptation (§06.6, REQ-072).
 *
 * A proportional controller aimed at 80% completion, correcting half the error
 * each week. Full correction oscillates; half converges. The change is always
 * announced to the user, and one anomalous week cannot collapse the ceiling.
 */

export const TARGET_COMPLETION = 0.8;
export const GAIN = 0.5;
export const MAX_STEP = 0.15;
export const MIN_UTILIZATION = 0.5;
export const MAX_UTILIZATION = 0.95;

/** Fewer sealed days than this is noise, not a signal about capacity. */
export const MIN_SESSIONS_TO_ADAPT = 3;

export interface Adaptation {
  utilization: number;
  previous: number;
  deltaPct: number;
  message: string;
  /** False when there was not enough evidence to change anything. */
  adapted: boolean;
}

/**
 * @param sessions sealed sessions behind `completionRate`. Below
 * MIN_SESSIONS_TO_ADAPT the load is held: adjusting a week's capacity on the
 * strength of one or two days would chase noise, and a user who happened to
 * finish a light Monday would be handed a heavier week for it.
 */
export function adapt(
  utilization: number,
  completionRate: number,
  sessions = MIN_SESSIONS_TO_ADAPT,
): Adaptation {
  if (sessions < MIN_SESSIONS_TO_ADAPT) {
    return {
      utilization,
      previous: utilization,
      deltaPct: 0,
      adapted: false,
      message: `Not enough closed days yet to change your load — ${MIN_SESSIONS_TO_ADAPT} is the minimum.`,
    };
  }

  const error = completionRate - TARGET_COMPLETION;
  const step = clamp(GAIN * error, -MAX_STEP, MAX_STEP);
  const next = round2(
    clamp(utilization + step, MIN_UTILIZATION, MAX_UTILIZATION),
  );

  const deltaPct = Math.round(((next - utilization) / utilization) * 100);

  return {
    utilization: next,
    previous: utilization,
    deltaPct,
    adapted: true,
    message:
      deltaPct === 0
        ? "Keeping next week's planned load the same."
        : deltaPct < 0
          ? `Reducing next week's planned load by ${Math.abs(deltaPct)}%.`
          : `Raising next week's planned load by ${deltaPct}%.`,
  };
}

/** The dominant failure pattern drives the weekly review's headline. */
export function dominantReason(
  histogram: Record<string, number>,
): { reason: string; count: number } | null {
  const entries = Object.entries(histogram).filter(([, c]) => c > 0);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { reason: entries[0][0], count: entries[0][1] };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
