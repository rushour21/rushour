import { chat } from "./client";
import {
  goalTreeJsonSchema,
  goalTreeSchema,
  ifThenJsonSchema,
  ifThenSchema,
  taskBreakdownJsonSchema,
  taskBreakdownSchema,
  type GoalTreeDraft,
  type TaskBreakdown,
} from "./contracts";

/** Call site 1 (REQ-002). Falls back to null; the UI then shows a manual form. */
export async function draftGoalTree(
  directionText: string,
  categories: string[],
): Promise<GoalTreeDraft | null> {
  const raw = await chat({
    system:
      "You turn a person's stated direction into a small goal hierarchy. " +
      "Return at most 3 goals. Each goal: a one-year direction phrased as who they " +
      "become, one objective for this quarter, one outcome for this month. " +
      "Be concrete and modest in scope. Never invent commitments they did not mention.",
    user: `Direction: ${directionText}\nCategories: ${categories.join(", ") || "unspecified"}`,
    schema: { name: "goal_tree", schema: goalTreeJsonSchema },
  });
  if (!raw) return null;

  const parsed = goalTreeSchema.safeParse(safeJson(raw));
  return parsed.success ? parsed.data : null;
}

/** Call site 2. Falls back to null; the user types tasks themselves. */
export async function breakDownOutcome(
  outcome: string,
  availableMin: number,
): Promise<TaskBreakdown | null> {
  const raw = await chat({
    system:
      "Break one day's outcome into 3-5 concrete tasks. For each give three " +
      "durations in minutes: minimum (the smallest version that still counts), " +
      "target, and stretch. Minimum must be well under target. Total target " +
      "duration must not exceed the available minutes given.",
    user: `Outcome: ${outcome}\nAvailable minutes today: ${availableMin}`,
    schema: { name: "task_breakdown", schema: taskBreakdownJsonSchema },
  });
  if (!raw) return null;

  const parsed = taskBreakdownSchema.safeParse(safeJson(raw));
  return parsed.success ? parsed.data : null;
}

/** Call site 3 (REQ-034). Falls back to a template. */
export async function draftIfThen(
  taskTitle: string,
  obstacle: string,
): Promise<{ cue: string; response: string }> {
  const raw = await chat({
    system:
      "Write one implementation intention. The cue must be an observable event " +
      "- a time, a place, or a specific action - never a feeling or an intention. " +
      "The response must be a single physical action that takes under 30 seconds " +
      "to begin.",
    user: `Task: ${taskTitle}\nWhat gets in the way: ${obstacle}`,
    schema: { name: "if_then", schema: ifThenJsonSchema },
  });

  const parsed = raw ? ifThenSchema.safeParse(safeJson(raw)) : null;
  if (parsed?.success) return parsed.data;

  return {
    cue: `If I notice ${obstacle.toLowerCase()}`,
    response: `then I will write the urge down and start "${taskTitle}" for 5 minutes.`,
  };
}

export interface WeeklyStats {
  sessions: number;
  plannedMin: number;
  completedMin: number;
  completionRate: number;
  plannedTasks: number;
  completedTasks: number;
  dominantPattern: string | null;
  dominantCount: number;
  multiplierBefore: number;
  multiplierAfter: number;
  utilizationBefore: number;
  utilizationAfter: number;
}

/**
 * Call site 4 (REQ-070). The narrative receives only computed figures and may
 * use no number absent from them. The response is validated against that rule -
 * if the model invents a statistic, we fall back to numbers alone, because one
 * fabricated figure costs every real one its authority.
 */
export async function weeklyNarrative(stats: WeeklyStats): Promise<string | null> {
  const allowed = allowedNumbers(stats);

  const raw = await chat({
    system:
      "You write one short paragraph (max 60 words) diagnosing a person's week " +
      "from the figures given. Name the pattern and one specific change. " +
      "Do not congratulate, do not use motivational language, do not moralise. " +
      "Use ONLY numbers that appear in the input. Never invent a figure.",
    user: JSON.stringify(stats),
    maxTokens: 200,
  });
  if (!raw) return null;

  return groundedInNumbers(raw, allowed) ? raw.trim() : null;
}

/** Numbers the narrative is permitted to state, in the forms it might write them. */
function allowedNumbers(stats: WeeklyStats): Set<string> {
  const out = new Set<string>();
  const add = (n: number) => {
    out.add(String(Math.round(n)));
    out.add(String(Math.round(n * 10) / 10));
  };
  add(stats.sessions);
  add(stats.plannedMin);
  add(stats.completedMin);
  add(stats.plannedTasks);
  add(stats.completedTasks);
  add(stats.dominantCount);
  add(stats.completionRate * 100);
  add(stats.plannedMin / 60);
  add(stats.completedMin / 60);
  add(stats.multiplierBefore);
  add(stats.multiplierAfter);
  add(stats.multiplierBefore * 100);
  add(stats.multiplierAfter * 100);
  add(stats.utilizationBefore * 100);
  add(stats.utilizationAfter * 100);
  add(Math.abs(stats.utilizationAfter - stats.utilizationBefore) * 100);
  add((1 - stats.completionRate) * 100);
  return out;
}

export function groundedInNumbers(text: string, allowed: Set<string>): boolean {
  const found = text.match(/\d+(?:\.\d+)?/g) ?? [];
  return found.every((n) => allowed.has(n) || allowed.has(String(Math.round(Number(n)))));
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
