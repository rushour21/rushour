import { connectDb } from "@/lib/db/client";
import { NodeModel } from "@/lib/db/models";
import { requireUser } from "@/lib/actions/context";
import { MAX_ACTIVE_GOALS } from "@/lib/limits";
import { AppShell } from "@/components/shell";
import { GoalList } from "./list";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const ctx = await requireUser();
  await connectDb();

  const nodes = await NodeModel.find({ userId: ctx.userId, type: "year" })
    .sort({ status: 1, createdAt: -1 })
    .lean();

  const goals = JSON.parse(JSON.stringify(nodes)) as {
    _id: string;
    title: string;
    category: string;
    status: string;
    weight: number;
  }[];

  return (
    <AppShell name={ctx.user.name} active="goals">
      <GoalList
        goals={goals.map((g) => ({ ...g, _id: String(g._id) }))}
        maxActive={MAX_ACTIVE_GOALS}
      />
    </AppShell>
  );
}
