"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDb } from "@/lib/db/client";
import { NodeModel, User } from "@/lib/db/models";
import { draftGoalTree } from "@/lib/ai/sites";
import { assertGoalSlot } from "@/lib/goal-core";
import { GoalLimitError, MAX_ACTIVE_GOALS } from "@/lib/limits";
import { requireUser } from "./context";

export type OnboardState = { error?: string; ok?: boolean } | undefined;

/**
 * Stage 2 (REQ-002). The AI draft is a convenience, never a dependency: if the
 * model is unavailable the user is handed the same form to fill in themselves.
 */
export async function draftDirection(directionText: string, categories: string[]) {
  await requireUser();
  const draft = await draftGoalTree(directionText, categories);
  return draft?.goals ?? null;
}

const saveDirectionSchema = z.object({
  goals: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        category: z.string().max(40).default(""),
        active: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(5),
});

export async function saveDirection(payload: unknown): Promise<OnboardState> {
  const { userId } = await requireUser();
  const parsed = saveDirectionSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const active = parsed.data.goals.filter((g) => g.active);
  if (active.length === 0) {
    return { error: "Choose at least one goal to work on now." };
  }
  if (active.length > MAX_ACTIVE_GOALS) {
    return {
      error: `Choose at most ${MAX_ACTIVE_GOALS}. Everything else goes to Later — you can promote it once one is finished.`,
    };
  }

  await connectDb();
  try {
    for (let i = 0; i < active.length; i++) await assertGoalSlot(userId);
  } catch (e) {
    if (e instanceof GoalLimitError) return { error: e.message };
    throw e;
  }

  await NodeModel.insertMany(
    parsed.data.goals.map((g) => ({
      userId,
      type: "year",
      title: g.title,
      category: g.category,
      status: g.active ? "active" : "later",
      weight: g.active ? 4 : 2,
      path: [],
    })),
  );

  await User.updateOne({ _id: userId }, { $set: { "onboarding.direction": true } });
  redirect("/onboarding/constraints");
}

const constraintsSchema = z.object({
  sleepTargetH: z.coerce.number().min(4).max(12),
  workH: z.coerce.number().min(0).max(16),
  commuteH: z.coerce.number().min(0).max(6),
  mealsH: z.coerce.number().min(0).max(6),
  lifeH: z.coerce.number().min(0).max(10),
  timezone: z.string().min(1),
});

export async function saveConstraints(
  _prev: OnboardState,
  formData: FormData,
): Promise<OnboardState> {
  const { userId } = await requireUser();
  const parsed = constraintsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { timezone, ...profile } = parsed.data;
  const totalH = profile.sleepTargetH + profile.workH + profile.commuteH + profile.mealsH + profile.lifeH;
  if (totalH >= 24) {
    return {
      error: `Those commitments add up to ${totalH} hours a day. There are 24. Adjust one.`,
    };
  }

  await connectDb();
  await User.updateOne(
    { _id: userId },
    { $set: { profile, timezone, "onboarding.constraints": true } },
  );

  revalidatePath("/today");
  redirect("/home");
}
