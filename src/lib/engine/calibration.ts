/**
 * Estimation calibration (§06.2, REQ-074).
 *
 * People underestimate. The multiplier learns by how much *this* person does,
 * but must be useful on day one — so it shrinks toward a global prior and
 * converges on the individual as evidence arrives.
 */

/** Global prior: people plan ~40% short. Used at n = 0. */
export const PRIOR_MULTIPLIER = 1.4;
/** Prior strength in observations. At n = k the estimate sits halfway. */
export const PRIOR_STRENGTH = 12;
/** Only the most recent observations count, so the multiplier can track change. */
export const WINDOW = 40;

export const MIN_MULTIPLIER = 0.8;
export const MAX_MULTIPLIER = 3.0;

export interface Observation {
  estimateTargetMin: number;
  actualMin: number;
  /** Auto-closed sessions and truncated timers never feed calibration. */
  suspect?: boolean;
}

export interface Calibration {
  multiplier: number;
  /** Observations actually used. Below 5 the multiplier is labelled "estimated". */
  n: number;
  /** True once there is enough evidence to present the number without a caveat. */
  confident: boolean;
}

/**
 * Geometric mean, not arithmetic: these are ratios. With an arithmetic mean a
 * single 5x overrun dominates the estimate permanently.
 *
 *   multiplier = exp( (n·ln(personal) + k·ln(prior)) / (n + k) )
 */
export function calibrate(observations: Observation[]): Calibration {
  const usable = observations
    .filter((o) => !o.suspect && o.estimateTargetMin > 0 && o.actualMin > 0)
    .slice(-WINDOW);

  const n = usable.length;
  if (n === 0) {
    return { multiplier: PRIOR_MULTIPLIER, n: 0, confident: false };
  }

  const logSum = usable.reduce(
    (acc, o) => acc + Math.log(o.actualMin / o.estimateTargetMin),
    0,
  );
  const logPersonal = logSum / n;

  const blended =
    (n * logPersonal + PRIOR_STRENGTH * Math.log(PRIOR_MULTIPLIER)) /
    (n + PRIOR_STRENGTH);

  const multiplier = clamp(Math.exp(blended), MIN_MULTIPLIER, MAX_MULTIPLIER);

  return {
    multiplier: Math.round(multiplier * 100) / 100,
    n,
    confident: n >= 5,
  };
}

/** "You said 1h — expect 1h 25m". Shown wherever an estimate is entered. */
export function adjust(estimateMin: number, multiplier: number): number {
  return Math.round(estimateMin * multiplier);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
