export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  detail: string;
  tags: string[];
  priority: "High" | "Medium" | "Low";
  milestones: Milestone[];
  tone: "sky" | "rose" | "amber" | "violet";
}

/** A goal's completion, derived from its milestones - never stored, so it
 *  can never drift from what's actually checked off. */
export function goalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return 0;
  const done = goal.milestones.filter((m) => m.done).length;
  return Math.round((done / goal.milestones.length) * 100);
}

/** A goal counts as done once every milestone on it is checked off - and
 *  only once it has at least one, so an empty goal isn't "done" by default. */
export function goalDone(goal: Goal): boolean {
  return goal.milestones.length > 0 && goal.milestones.every((m) => m.done);
}
