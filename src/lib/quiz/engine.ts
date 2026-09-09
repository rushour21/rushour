/**
 * The daily quiz engine: difficulty progression and question selection.
 *
 * Pure functions, no framework or storage import, following the same
 * discipline as the original planning engine (lib/engine) - every number the
 * quiz produces should be reproducible and explainable, and this is the part
 * that decides what happens next, not the AI.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export const MIN_DIFFICULTY: Difficulty = 1;
export const MAX_DIFFICULTY: Difficulty = 5;
export const MAX_QUESTIONS_PER_DAY = 10;

/** Consecutive correct answers needed before the difficulty steps up. */
const STEP_UP_STREAK = 2;

export interface QuizRecord {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  askedAt: number;
  /** null until answered. */
  answeredIndex: number | null;
  correct: boolean | null;
}

/**
 * Next difficulty, given the difficulty just answered and whether it was
 * right. Steps up after two correct in a row at the current level, steps
 * down by one on a wrong answer, and never leaves [MIN, MAX].
 *
 * @param recentAtLevel outcomes (newest last) already answered at
 *   `lastDifficulty`, used to check the step-up streak without re-deriving it
 *   from the full history.
 */
export function nextDifficulty(
  lastDifficulty: Difficulty,
  wasCorrect: boolean,
  recentAtLevel: boolean[],
): Difficulty {
  if (!wasCorrect) {
    return clamp((lastDifficulty - 1) as Difficulty);
  }

  const streak = trailingTrueStreak([...recentAtLevel, true]);
  if (streak >= STEP_UP_STREAK) {
    return clamp((lastDifficulty + 1) as Difficulty);
  }
  return lastDifficulty;
}

function trailingTrueStreak(xs: boolean[]): number {
  let n = 0;
  for (let i = xs.length - 1; i >= 0; i--) {
    if (!xs[i]) break;
    n++;
  }
  return n;
}

function clamp(d: Difficulty): Difficulty {
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, d)) as Difficulty;
}

/**
 * Today's difficulty to generate at, derived from the full answered history.
 * Unanswered/skipped records are ignored. Starts at the minimum with no
 * history - the quiz should be easy on day one, not presumptuous.
 */
export function currentDifficulty(history: QuizRecord[]): Difficulty {
  const answered = history
    .filter((q) => q.correct !== null)
    .sort((a, b) => a.askedAt - b.askedAt);

  if (answered.length === 0) return MIN_DIFFICULTY;

  let level: Difficulty = MIN_DIFFICULTY;
  let streakAtLevel: boolean[] = [];

  for (const q of answered) {
    if (q.difficulty !== level) {
      level = q.difficulty;
      streakAtLevel = [];
    }
    const correct = Boolean(q.correct);
    level = nextDifficulty(level, correct, streakAtLevel);
    streakAtLevel = correct ? [...streakAtLevel, true] : [];
  }

  return level;
}

/**
 * Which past questions are eligible to reappear today: answered wrong, and
 * not already reused too recently. A question answered correctly is retired
 * for good - that's the whole point of not wasting the user's time re-asking
 * what they've already shown they know.
 */
export function dueForRetry(history: QuizRecord[], today: string): QuizRecord[] {
  return history.filter((q) => q.correct === false && localDate(q.askedAt) !== today);
}

/** Question texts that must never be generated again (answered correctly). */
export function retiredQuestions(history: QuizRecord[]): Set<string> {
  return new Set(history.filter((q) => q.correct === true).map((q) => q.question));
}

function localDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
