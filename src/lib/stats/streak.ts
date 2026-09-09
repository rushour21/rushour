import type { ClockRecord } from "@/lib/store/clock";

/**
 * The current-streak stat on Dashboard, derived from real clock-in history
 * rather than a hardcoded "6 days". A day counts if at least one session was
 * clocked out on it - showing up, not finishing everything, matching the
 * "streaks measure showing up" principle from the rest of the app.
 *
 * Deliberately simpler than the old engine's streak() (lib/engine/progress.ts,
 * which banks earned rest days): that one operates on the disconnected
 * Mongo-backed DayRecord shape and isn't wired to this UI. This is the plain
 * consecutive-day version until/unless rest-day banking is worth rebuilding
 * against real clock history specifically.
 *
 * Pure and framework-free so it's testable without a DOM or localStorage.
 */
export function currentStreak(history: ClockRecord[], now: Date = new Date()): number {
  const days = new Set(history.map((r) => localDateKey(new Date(r.clockOut))));
  if (days.size === 0) return 0;

  let streak = 0;
  const cursor = new Date(now);

  // Today doesn't have to have a session yet for the streak to still be
  // "alive" - it only breaks once a full day is skipped.
  if (!days.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
