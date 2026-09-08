"use server";

import { breakDownOutcome as aiBreakDown } from "@/lib/ai/sites";
import { requireUser } from "./context";

/** Call site 2. Returns null on any failure; the user then types tasks in. */
export async function breakDownOutcome(outcome: string, availableMin: number) {
  await requireUser();
  const result = await aiBreakDown(outcome, availableMin);
  return result?.tasks ?? null;
}
