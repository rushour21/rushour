/**
 * Shared types for the planning engine.
 *
 * Nothing in `lib/engine` may import mongo, openai, react or node built-ins.
 * The engine runs unchanged in the browser (live capacity preview while the
 * user edits a plan) and on the server (the authoritative check).
 */

export type ReadinessBand = "HIGH" | "MEDIUM" | "LOW";

/** Multiplier applied to available minutes for each readiness band (§06.3). */
export const BAND_FACTOR: Record<ReadinessBand, number> = {
  HIGH: 1.0,
  MEDIUM: 0.8,
  LOW: 0.55,
};

/** Three-tier estimate. Written once at task creation, never overwritten. */
export interface EstimateMin {
  minimum: number;
  target: number;
  stretch: number;
}

export interface PlanItem {
  nodeId: string;
  title: string;
  estimateMin: EstimateMin;
  /** Goal weight 1..5, inherited from the owning year node. */
  weight?: number;
  goalId?: string;
  dueAt?: Date | null;
}

export type FailureReason =
  | "overscheduled"
  | "unexpected"
  | "distracted"
  | "low_energy"
  | "underestimated"
  | "blocked"
  | "procrastinated";

export const FAILURE_REASONS: { value: FailureReason; label: string }[] = [
  { value: "overscheduled", label: "I planned too much" },
  { value: "unexpected", label: "Unexpected work appeared" },
  { value: "distracted", label: "I got distracted" },
  { value: "low_energy", label: "No energy" },
  { value: "underestimated", label: "Harder than I thought" },
  { value: "blocked", label: "Blocked on something else" },
  { value: "procrastinated", label: "I put it off" },
];
