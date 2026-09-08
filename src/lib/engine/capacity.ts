import { BAND_FACTOR, type PlanItem, type ReadinessBand } from "./types";

/** Fraction of the window reserved for interruptions before anything is planned. */
export const DAY_BUFFER = 0.12;
export const WEEK_BUFFER = 0.15;

export interface CapacityInput {
  /** Total minutes in the planning window (clock-in to planned clock-out, or 168h). */
  windowMin: number;
  /** Minutes already committed inside the window: work, commute, meals, meetings. */
  fixedMin: number;
  items: PlanItem[];
  /** Personal estimation multiplier from calibration (§06.2). */
  multiplier: number;
  /** Target utilisation from adaptation (§06.6). */
  utilization: number;
  band: ReadinessBand;
  bufferRate?: number;
}

export interface CapacityVerdict {
  windowMin: number;
  fixedMin: number;
  bufferMin: number;
  /** What can actually be planned, after buffer, utilisation and readiness. */
  availableMin: number;
  /** Sum of Target estimates, adjusted by the personal multiplier. */
  demandMin: number;
  /** available - demand. Negative blocks the commit (REQ-032). */
  verdictMin: number;
  overloaded: boolean;
  /** Demand below half of available: worth noting, never blocking. */
  underplanned: boolean;
}

/**
 * The capacity check (§06.1). This is the heart of the product: it answers
 * "given your actual life, what fits" rather than "what do you want to do".
 */
export function capacity(input: CapacityInput): CapacityVerdict {
  const bufferRate = input.bufferRate ?? DAY_BUFFER;
  const windowMin = Math.max(0, input.windowMin);
  const fixedMin = Math.max(0, input.fixedMin);

  const bufferMin = Math.round(windowMin * bufferRate);
  const raw = windowMin - fixedMin - bufferMin;
  const availableMin = Math.max(
    0,
    Math.round(raw * input.utilization * BAND_FACTOR[input.band]),
  );

  const targetSum = input.items.reduce((n, i) => n + i.estimateMin.target, 0);
  const demandMin = Math.round(targetSum * input.multiplier);

  const verdictMin = availableMin - demandMin;

  return {
    windowMin,
    fixedMin,
    bufferMin,
    availableMin,
    demandMin,
    verdictMin,
    overloaded: verdictMin < 0,
    underplanned: demandMin > 0 && demandMin < availableMin * 0.5,
  };
}

/** Minutes as "2h 15m" / "45m". Every overage is stated in these units. */
export function hm(min: number): string {
  const sign = min < 0 ? "-" : "";
  const a = Math.abs(Math.round(min));
  const h = Math.floor(a / 60);
  const m = a % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

/**
 * Greedy fill used by rescue mode (REQ-041) and by the "what should we cut"
 * prompt. Returns the items that fit at the given tier, in the order supplied,
 * plus everything that does not.
 */
export function fitToWindow(
  items: PlanItem[],
  budgetMin: number,
  multiplier: number,
  tier: "minimum" | "target" = "minimum",
): { keep: PlanItem[]; defer: PlanItem[]; usedMin: number } {
  const keep: PlanItem[] = [];
  const defer: PlanItem[] = [];
  let usedMin = 0;

  for (const item of items) {
    const cost = Math.round(item.estimateMin[tier] * multiplier);
    if (usedMin + cost <= budgetMin) {
      keep.push(item);
      usedMin += cost;
    } else {
      defer.push(item);
    }
  }

  return { keep, defer, usedMin };
}
