"use server";

import { draftGoalTree } from "@/lib/ai/sites";
import { requireUser } from "./context";

/**
 * Stage 2 (REQ-002). The AI draft is a convenience, never a dependency: if the
 * model is unavailable the user is handed the same form to fill in themselves.
 */
export async function draftDirection(directionText: string, categories: string[]) {
  await requireUser();
  const draft = await draftGoalTree(directionText, categories);
  return draft?.goals ?? null;
}
