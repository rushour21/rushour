/**
 * Habit drift (§06.4, REQ-050).
 *
 * Deliberately not a streak. A streak makes a missed day a reason to quit; a
 * drift figure makes it a data point. The output is a plain sentence with real
 * numbers, followed by a question about cause.
 */

export const SLOPE_THRESHOLD = 4; // minutes later, per day
export const DEVIATION_THRESHOLD = 20; // minutes from target

export interface DriftObservation {
  /** Days ago is not used: index order is chronological, oldest first. */
  deviationMin: number;
}

export interface Drift {
  /** Minutes per day the habit is moving away from target. */
  slopeMinPerDay: number;
  meanDeviationMin: number;
  alert: boolean;
  n: number;
  message: string | null;
}

export function drift(observations: DriftObservation[]): Drift {
  const xs = observations.slice(-14);
  const n = xs.length;

  if (n < 5) {
    return { slopeMinPerDay: 0, meanDeviationMin: 0, alert: false, n, message: null };
  }

  const meanX = (n - 1) / 2;
  const meanY = xs.reduce((a, o) => a + o.deviationMin, 0) / n;

  let num = 0;
  let den = 0;
  xs.forEach((o, i) => {
    num += (i - meanX) * (o.deviationMin - meanY);
    den += (i - meanX) ** 2;
  });

  const slope = den === 0 ? 0 : num / den;
  const slopeMinPerDay = Math.round(slope * 10) / 10;
  const meanDeviationMin = Math.round(meanY);

  const alert =
    slopeMinPerDay > SLOPE_THRESHOLD &&
    Math.abs(meanDeviationMin) > DEVIATION_THRESHOLD;

  return {
    slopeMinPerDay,
    meanDeviationMin,
    alert,
    n,
    message: alert
      ? `Drifting about ${Math.abs(slopeMinPerDay)} min later per day — now averaging ${Math.abs(meanDeviationMin)} min past target.`
      : null,
  };
}
