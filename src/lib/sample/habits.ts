export interface Habit {
  id: string;
  name: string;
  target: string;
  icon: string;
  tone: "amber" | "mint" | "sky" | "violet" | "rose";
  done: boolean;
  value?: string;
  frequency: string;
  streak: number;
  completion: number;
  goal: { label: string; tone: "mint" | "sky" | "amber" | "violet" };
}

export const HABITS: Habit[] = [
  { id: "h1", name: "Wake up early", target: "Target: 6:30 AM", icon: "sun", tone: "amber", done: true, value: "6:42 AM", frequency: "Daily", streak: 3, completion: 80, goal: { label: "Health", tone: "mint" } },
  { id: "h2", name: "Exercise", target: "Target: 30 min", icon: "dumbbell", tone: "mint", done: false, frequency: "4x per week", streak: 1, completion: 60, goal: { label: "Health", tone: "mint" } },
  { id: "h3", name: "Deep work", target: "Target: 2 hours", icon: "laptop", tone: "sky", done: true, value: "2h 15m", frequency: "Daily", streak: 5, completion: 75, goal: { label: "Career", tone: "sky" } },
  { id: "h4", name: "Read", target: "Target: 20 min", icon: "book", tone: "violet", done: false, frequency: "Daily", streak: 2, completion: 50, goal: { label: "Learning", tone: "amber" } },
  { id: "h5", name: "Drink water", target: "Target: 8 glasses", icon: "drop", tone: "sky", done: false, frequency: "Daily", streak: 4, completion: 65, goal: { label: "Health", tone: "mint" } },
  { id: "h6", name: "Sleep on time", target: "Target: 11:00 PM", icon: "moon", tone: "violet", done: false, frequency: "Daily", streak: 0, completion: 40, goal: { label: "Health", tone: "mint" } },
];

/** Mon–Sun completion per habit. */
export const WEEK_GRID: { name: string; days: boolean[] }[] = [
  { name: "Wake up", days: [true, true, true, true, false, true, false] },
  { name: "Exercise", days: [false, false, false, false, false, false, true] },
  { name: "Deep work", days: [true, true, true, true, true, false, false] },
  { name: "Read", days: [true, false, true, true, false, true, false] },
  { name: "Water", days: [true, true, true, true, true, true, true] },
  { name: "Sleep", days: [false, false, true, false, false, false, false] },
];

export const COMPLETION_BARS = [
  35, 42, 55, 48, 62, 70, 58, 66, 74, 60, 52, 68, 78, 71, 64, 58,
  49, 63, 72, 80, 68, 55, 61, 70, 76, 66, 58, 72, 84, 77,
];

export const HABIT_INSIGHTS = [
  { id: "hi1", tone: "rose" as const, icon: "down", text: "Your exercise consistency dropped this week." },
  { id: "hi2", tone: "violet" as const, icon: "moon", text: "You sleep 42 min later on average when you miss exercise." },
  { id: "hi3", tone: "amber" as const, icon: "bulb", text: "Try a shorter workout (15 min) to maintain your streak." },
];
