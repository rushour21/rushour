export type GoalStatus = "on-track" | "at-risk" | "behind" | "done";

export interface Goal {
  id: string;
  title: string;
  detail: string;
  pct: number;
  tags: string[];
  priority: "High" | "Medium" | "Low";
  milestones: [number, number];
  tasks: number;
  projects: number;
  tone: "sky" | "rose" | "amber" | "violet";
  status: GoalStatus;
}

export const YEAR_GOALS: Goal[] = [
  { id: "y1", title: "Become a stronger AI Engineer", detail: "Build deep expertise in full-stack and AI engineering, and land a great opportunity.", pct: 68, tags: ["Career", "Learning"], priority: "High", milestones: [3, 5], tasks: 12, projects: 2, tone: "sky", status: "on-track" },
  { id: "y2", title: "Build a healthier lifestyle", detail: "Be more active, sleep better, and maintain mental well-being.", pct: 52, tags: ["Health", "Personal"], priority: "High", milestones: [2, 4], tasks: 8, projects: 1, tone: "rose", status: "on-track" },
  { id: "y3", title: "Read more books", detail: "Read at least 24 books this year (2 per month).", pct: 33, tags: ["Learning", "Personal"], priority: "Medium", milestones: [2, 6], tasks: 6, projects: 0, tone: "amber", status: "at-risk" },
  { id: "y4", title: "Grow my career", detail: "Improve skills, build network, and switch to a product-based company.", pct: 45, tags: ["Career", "Personal"], priority: "High", milestones: [3, 5], tasks: 10, projects: 1, tone: "violet", status: "on-track" },
];

export const MONTH_FOCUS = [
  { id: "m1", title: "Finish portfolio project", pct: 75, tone: "mint" as const },
  { id: "m2", title: "Exercise 12 times", pct: 50, tone: "amber" as const },
  { id: "m3", title: "Read 2 books", pct: 25, tone: "violet" as const },
];
