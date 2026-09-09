"use server";

import { generateQuizBatch } from "@/lib/ai/sites";
import { aiEnabled } from "@/lib/ai/client";
import type { QuizBatch } from "@/lib/ai/contracts";

/**
 * Generates new quiz questions. A thin server action, same shape as the
 * other AI call sites (draftDirection, breakDownOutcome): the OpenAI key
 * never reaches the client, and the caller gets null on any failure rather
 * than an error that blocks the quiz from loading.
 */
type QuizResult = { error: string } | { questions: QuizBatch["questions"] };

export async function requestQuizQuestions(
  resumeText: string,
  difficulty: number,
  count: number,
  excludeQuestions: string[],
): Promise<QuizResult> {
  if (!resumeText.trim()) return { error: "Add your resume first." };
  if (!aiEnabled()) return { error: "no-ai" };

  const batch = await generateQuizBatch(resumeText, difficulty, count, excludeQuestions);
  if (!batch) return { error: "generation-failed" };

  return { questions: batch.questions };
}
