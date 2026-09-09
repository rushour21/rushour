"use client";

import { createLocalStore, newId } from "./local-store";
import type { QuizRecord } from "@/lib/quiz/engine";

export type { QuizRecord };

/**
 * Every quiz question ever generated, permanently. This is what makes
 * "don't repeat a correct answer" and "gradually increase difficulty"
 * possible at all - both are pure functions over this history
 * (lib/quiz/engine.ts), not something the AI is trusted to track itself.
 */
export const quizStore = createLocalStore<QuizRecord>("rushour.quiz", []);

export function newQuizId(): string {
  return newId("quiz");
}
