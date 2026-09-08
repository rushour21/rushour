import { BAND_FACTOR, type ReadinessBand } from "./types";

/**
 * Readiness (§06.3, REQ-060).
 *
 * Three inputs collected at clock-in, plus yesterday's load. Every component
 * and weight is inspectable in the UI — a score the user cannot audit is a
 * score they stop believing. This is self-management, not a clinical measure.
 */

export interface ReadinessWeights {
  sleep: number;
  energy: number;
  stress: number;
  recovery: number;
}

export const DEFAULT_WEIGHTS: ReadinessWeights = {
  sleep: 0.35,
  energy: 0.3,
  stress: 0.2,
  recovery: 0.15,
};

export interface ReadinessInput {
  sleepHours: number;
  sleepTargetHours: number;
  /** 1..5, self-reported at clock-in. */
  energy: number;
  /** 1..5, self-reported at clock-in. 5 is worst. */
  stress: number;
  /** Yesterday's actual work / yesterday's available. 1.0 = exactly at capacity. */
  yesterdayLoad?: number;
  weights?: ReadinessWeights;
}

export interface Readiness {
  score: number;
  band: ReadinessBand;
  /** Multiplier this band applies to available minutes. */
  factor: number;
  /** `recovery` is null until there is a prior session to measure it against. */
  components: {
    sleep: number;
    energy: number;
    stress: number;
    recovery: number | null;
  };
  weights: ReadinessWeights;
}

export function readiness(input: ReadinessInput): Readiness {
  const w = input.weights ?? DEFAULT_WEIGHTS;
  const target = input.sleepTargetHours > 0 ? input.sleepTargetHours : 7.5;

  const sleep = clamp01(input.sleepHours / target) * 100;
  const energy = clamp(input.energy, 1, 5) * 20;
  const stress = (6 - clamp(input.stress, 1, 5)) * 20;

  // No prior session means no evidence of recovery. Scoring it as a perfect 100
  // would inflate the score by the full recovery weight on day one and after
  // every gap - precisely the days a user most needs an honest LOW. Instead the
  // known components are renormalised over their own weights.
  const hasRecovery = input.yesterdayLoad !== undefined;
  const load = input.yesterdayLoad ?? 0;
  const recovery = load <= 1 ? 100 : clamp01(2 - load) * 100;

  const weighted =
    w.sleep * sleep +
    w.energy * energy +
    w.stress * stress +
    (hasRecovery ? w.recovery * recovery : 0);
  const totalWeight =
    w.sleep + w.energy + w.stress + (hasRecovery ? w.recovery : 0);

  const score = Math.round(totalWeight > 0 ? weighted / totalWeight : 0);

  const band: ReadinessBand = score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";

  return {
    score,
    band,
    factor: BAND_FACTOR[band],
    components: {
      sleep: Math.round(sleep),
      energy: Math.round(energy),
      stress: Math.round(stress),
      recovery: hasRecovery ? Math.round(recovery) : null,
    },
    weights: w,
  };
}

/**
 * Stated as arithmetic, never as advice. If someone targets a 5:30 wake on a
 * 00:30 bedtime, the app shows the resulting sleep window and stops there.
 */
export function sleepWindowHours(bedtime: string, wake: string): number {
  const b = minutesOfDay(bedtime);
  const w = minutesOfDay(wake);
  const span = w >= b ? w - b : 1440 - b + w;
  return Math.round((span / 60) * 10) / 10;
}

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
