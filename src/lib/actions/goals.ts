"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDb } from "@/lib/db/client";
import { NodeModel } from "@/lib/db/models";
import { assertGoalSlot } from "@/lib/goal-core";
import { GoalLimitError } from "@/lib/limits";
import { requireUser } from "./context";


const createGoalSchema = z.object({
  title: z.string().min(3).max(120),
  category: z.string().max(40).optional().default(""),
  weight: z.coerce.number().min(1).max(5).default(3),
  status: z.enum(["active", "later"]).default("active"),
});

export type GoalState = { error?: string; ok?: boolean } | undefined;

export async function createGoal(_prev: GoalState, formData: FormData): Promise<GoalState> {
  const { userId } = await requireUser();
  const parsed = createGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDb();

  if (parsed.data.status === "active") {
    try {
      await assertGoalSlot(userId);
    } catch (e) {
      if (e instanceof GoalLimitError) return { error: e.message };
      throw e;
    }
  }

  await NodeModel.create({
    userId,
    type: "year",
    title: parsed.data.title,
    category: parsed.data.category,
    weight: parsed.data.weight,
    status: parsed.data.status,
    path: [],
  });

  revalidatePath("/goals");
  return { ok: true };
}

export async function parkGoal(nodeId: string): Promise<void> {
  const { userId } = await requireUser();
  await connectDb();
  await NodeModel.updateOne(
    { _id: nodeId, userId },
    { $set: { status: "parked", parkedAt: new Date() } },
  );
  revalidatePath("/goals");
}

export async function activateGoal(nodeId: string): Promise<GoalState> {
  const { userId } = await requireUser();
  await connectDb();

  try {
    await assertGoalSlot(userId, nodeId);
  } catch (e) {
    if (e instanceof GoalLimitError) return { error: e.message };
    throw e;
  }

  await NodeModel.updateOne(
    { _id: nodeId, userId },
    { $set: { status: "active" }, $unset: { parkedAt: 1 } },
  );
  revalidatePath("/goals");
  return { ok: true };
}

/** The Later list (REQ-011): stored, and excluded from every planning surface. */
export async function moveToLater(nodeId: string): Promise<void> {
  const { userId } = await requireUser();
  await connectDb();
  await NodeModel.updateOne({ _id: nodeId, userId }, { $set: { status: "later" } });
  revalidatePath("/goals");
}

export async function deleteNode(nodeId: string): Promise<void> {
  const { userId } = await requireUser();
  await connectDb();
  await NodeModel.deleteOne({ _id: nodeId, userId });
  revalidatePath("/goals");
}
