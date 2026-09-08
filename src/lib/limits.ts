/**
 * Product constants that are enforced rather than suggested.
 *
 * These live outside the "use server" modules: a server-action file may only
 * export async functions, so constants and classes must not sit alongside them.
 */

/** Admission control (REQ-010). */
export const MAX_ACTIVE_GOALS = 2;
export const REACTIVATION_GRACE_DAYS = 7;

/** A timer running this long without a heartbeat is not evidence of work. */
export const SUSPECT_SEGMENT_MIN = 240;

/** Lapse re-entry (REQ-042). */
export const REENTRY_GAP_DAYS = 3;
export const REENTRY_CEILING = 0.6;

/**
 * No single session is a 20-hour day. Caps the damage when a planned clock-out
 * rolls past midnight into the following evening.
 */
export const MAX_SESSION_WINDOW_MIN = 16 * 60;

/** Rescue fires when remaining demand exceeds remaining time by this factor. */
export const RESCUE_THRESHOLD = 1.2;

export class GoalLimitError extends Error {}
