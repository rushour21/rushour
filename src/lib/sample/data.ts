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

export interface Block {
  id: string;
  time: string;
  title: string;
  detail?: string;
  minutes: number;
  kind: "deep" | "meeting" | "break" | "health" | "admin";
}

export const PLAN_BLOCKS: Block[] = [
  { id: "b1", time: "9:00 AM", title: "Deep Work", detail: "Finish authentication system", minutes: 120, kind: "deep" },
  { id: "b2", time: "11:00 AM", title: "Team meeting", minutes: 30, kind: "meeting" },
  { id: "b3", time: "12:00 PM", title: "Lunch break", minutes: 60, kind: "break" },
  { id: "b4", time: "1:00 PM", title: "Deep Work", detail: "Continue authentication", minutes: 150, kind: "deep" },
  { id: "b5", time: "3:30 PM", title: "Workout", minutes: 60, kind: "health" },
  { id: "b6", time: "5:00 PM", title: "Wrap up & plan tomorrow", minutes: 30, kind: "admin" },
];

export const PROJECTS = [
  { id: "p1", name: "Portfolio", count: 8, tone: "sky" as const },
  { id: "p2", name: "Job Search", count: 6, tone: "rose" as const },
  { id: "p3", name: "Learning", count: 5, tone: "violet" as const },
  { id: "p4", name: "Health", count: 4, tone: "mint" as const },
  { id: "p5", name: "Personal", count: 3, tone: "sky" as const },
];

export const GOALS = [
  { id: "g1", title: "Grow in my career", subtitle: "Learn and build valuable skills", pct: 70, tone: "amber" as const },
  { id: "g2", title: "Be healthier", subtitle: "Workout 4x per week", pct: 50, tone: "rose" as const },
  { id: "g3", title: "Read more", subtitle: "12 books this year", pct: 25, tone: "violet" as const },
];

export const OUTCOME = {
  title: "Build authentication system",
  detail: "Ship a working MVP with login, signup and session management.",
};

export const CAPACITY = { availableMin: 330, plannedMin: 285 };

export const DAY_INSIGHTS = [
  { id: "i1", tone: "mint" as const, text: "Your plan fits your available time." },
  { id: "i2", tone: "sky" as const, text: "2 focus blocks (4h 30m) — great!" },
  { id: "i3", tone: "rose" as const, text: "You're including health — keep it up!" },
  { id: "i4", tone: "amber" as const, text: "Consider moving 1 low-priority task to tomorrow." },
];

export const WEEK_BARS = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 100 },
  { day: "Thu", value: 38 },
  { day: "Fri", value: 22 },
  { day: "Sat", value: 62 },
  { day: "Sun", value: 40 },
];

export const FOCUS_SPLIT = [
  { label: "Deep Work", value: 135, color: "#3b82f6" },
  { label: "Meetings", value: 80, color: "#8b5cf6" },
  { label: "Admin", value: 45, color: "#f59e0b" },
];

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
