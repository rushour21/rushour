import { describe, expect, it } from "vitest";
import {
  currentDifficulty,
  dueForRetry,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  nextDifficulty,
  retiredQuestions,
  type QuizRecord,
} from "../engine";

const q = (over: Partial<QuizRecord> = {}): QuizRecord => ({
  id: "q1",
  question: "What is a closure?",
  options: ["a", "b", "c", "d"],
  correctIndex: 0,
  explanation: "",
  difficulty: 1,
  topic: "JS",
  askedAt: Date.now(),
  answeredIndex: 0,
  correct: true,
  ...over,
});

describe("nextDifficulty", () => {
  it("steps down immediately on a wrong answer", () => {
    expect(nextDifficulty(3, false, [])).toBe(2);
  });

  it("does not step up on the first correct answer alone", () => {
    expect(nextDifficulty(2, true, [])).toBe(2);
  });

  it("steps up after two correct in a row at the same level", () => {
    expect(nextDifficulty(2, true, [true])).toBe(3);
  });

  it("never drops below the minimum", () => {
    expect(nextDifficulty(MIN_DIFFICULTY, false, [])).toBe(MIN_DIFFICULTY);
  });

  it("never rises above the maximum", () => {
    expect(nextDifficulty(MAX_DIFFICULTY, true, [true])).toBe(MAX_DIFFICULTY);
  });
});

describe("currentDifficulty", () => {
  it("starts at the minimum with no history - easy on day one", () => {
    expect(currentDifficulty([])).toBe(MIN_DIFFICULTY);
  });

  it("ignores unanswered records", () => {
    const history = [q({ correct: null, answeredIndex: null })];
    expect(currentDifficulty(history)).toBe(MIN_DIFFICULTY);
  });

  it("climbs after a real streak of correct answers", () => {
    const history = [
      q({ askedAt: 1, difficulty: 1, correct: true }),
      q({ askedAt: 2, difficulty: 1, correct: true }),
    ];
    // Two correct at level 1 -> level 2 for the next question.
    expect(currentDifficulty(history)).toBe(2);
  });

  it("drops back down after a wrong answer, even mid-streak", () => {
    const history = [
      q({ askedAt: 1, difficulty: 1, correct: true }),
      q({ askedAt: 2, difficulty: 1, correct: true }),
      q({ askedAt: 3, difficulty: 2, correct: false }),
    ];
    expect(currentDifficulty(history)).toBe(1);
  });
});

describe("retiredQuestions", () => {
  it("retires only questions answered correctly", () => {
    const history = [
      q({ question: "right one", correct: true }),
      q({ question: "wrong one", correct: false }),
      q({ question: "unanswered", correct: null }),
    ];
    const retired = retiredQuestions(history);
    expect(retired.has("right one")).toBe(true);
    expect(retired.has("wrong one")).toBe(false);
    expect(retired.has("unanswered")).toBe(false);
  });
});

describe("dueForRetry", () => {
  it("surfaces wrong answers from a previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const history = [q({ correct: false, askedAt: yesterday.getTime() })];
    expect(dueForRetry(history, todayKey())).toHaveLength(1);
  });

  it("does not immediately re-offer a question missed today", () => {
    const history = [q({ correct: false, askedAt: Date.now() })];
    expect(dueForRetry(history, todayKey())).toHaveLength(0);
  });

  it("excludes correctly-answered questions entirely", () => {
    const history = [q({ correct: true, askedAt: Date.now() - 86_400_000 })];
    expect(dueForRetry(history, todayKey())).toHaveLength(0);
  });
});

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
