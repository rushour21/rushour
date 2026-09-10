export interface Habit {
  id: string;
  name: string;
  target: string;
  icon: string;
  tone: "amber" | "mint" | "sky" | "violet" | "rose";
  frequency: string;
  goal: { label: string; tone: "mint" | "sky" | "amber" | "violet" };
  /** Local YYYY-MM-DD keys, one per day marked done. The only source of
   *  truth - streak and completion rate are always derived from this,
   *  never stored, so they can't drift from what was actually logged. */
  completedDates: string[];
}

export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isDoneOn(habit: Habit, dateKey: string): boolean {
  return habit.completedDates.includes(dateKey);
}

/** Consecutive completed days ending today - or ending yesterday, if today
 *  just hasn't been logged yet, so an unbroken streak doesn't drop to zero
 *  the moment the clock rolls over before you've had a chance to log it. */
export function habitStreak(habit: Habit, now: Date = new Date()): number {
  const d = new Date(now);
  if (!habit.completedDates.includes(localDateKey(d))) {
    d.setDate(d.getDate() - 1);
  }
  let streak = 0;
  while (habit.completedDates.includes(localDateKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function habitCompletionPct(habit: Habit, days: number, now: Date = new Date()): number {
  const d = new Date(now);
  let done = 0;
  for (let i = 0; i < days; i++) {
    if (habit.completedDates.includes(localDateKey(d))) done += 1;
    d.setDate(d.getDate() - 1);
  }
  return Math.round((done / days) * 100);
}
