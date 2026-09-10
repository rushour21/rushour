/**
 * Sample data for the frontend build.
 *
 * Kept in one file, clearly named, so the swap to real queries is a change of
 * import rather than a hunt through components. Every shape here matches what
 * the engine and models already produce, so nothing has to be reshaped later.
 */

export type Priority = "must" | "should" | "could";
export type Category = "Work" | "Health" | "Personal" | "Learning" | "Career";

export interface Task {
  id: string;
  title: string;
  minutes: number;
  priority: Priority;
  category: Category;
  project?: string;
  due: string;
  done: boolean;
  hasNotes?: boolean;
}

export const TASKS: Task[] = [
  { id: "t1", title: "Finish authentication system", minutes: 90, priority: "must", category: "Work", project: "Portfolio", due: "Today", done: false, hasNotes: true },
  { id: "t2", title: "Team meeting", minutes: 30, priority: "must", category: "Work", due: "Today", done: true },
  { id: "t3", title: "Workout", minutes: 60, priority: "must", category: "Health", due: "Today", done: false },
  { id: "t4", title: "Apply to 2 jobs", minutes: 45, priority: "should", category: "Career", project: "Job Search", due: "Today", done: false, hasNotes: true },
  { id: "t5", title: "Read React documentation", minutes: 30, priority: "should", category: "Learning", project: "Learning", due: "Today", done: false, hasNotes: true },
  { id: "t6", title: "Plan tomorrow", minutes: 60, priority: "should", category: "Personal", due: "Today", done: false, hasNotes: true },
  { id: "t7", title: "Read a book", minutes: 30, priority: "could", category: "Personal", due: "Today", done: false, hasNotes: true },
  { id: "t8", title: "Clean workspace", minutes: 30, priority: "could", category: "Personal", due: "Today", done: false, hasNotes: true },
];

export const PRIORITY_META: Record<
  Priority,
  { label: string; group: string; blurb: string; ring: string; chip: string; dot: string }
> = {
  must: {
    label: "Must",
    group: "Must Do",
    blurb: "Critical tasks for today",
    ring: "border-rose",
    chip: "bg-rose-soft text-rose",
    dot: "#f43f5e",
  },
  should: {
    label: "Should",
    group: "Should Do",
    blurb: "Important but flexible",
    ring: "border-amber",
    chip: "bg-amber-soft text-amber",
    dot: "#f59e0b",
  },
  could: {
    label: "Could",
    group: "Nice to Do",
    blurb: "Optional tasks",
    ring: "border-mint",
    chip: "bg-mint-soft text-mint",
    dot: "#16a34a",
  },
};

export const CATEGORY_CHIP: Record<Category, string> = {
  Work: "bg-sky-soft text-sky",
  Health: "bg-mint-soft text-mint",
  Personal: "bg-violet-soft text-violet",
  Learning: "bg-amber-soft text-amber",
  Career: "bg-rose-soft text-rose",
};

export function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function hmLong(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
