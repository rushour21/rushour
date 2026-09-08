import { NodeModel } from "@/lib/db/models";
import { GoalLimitError, MAX_ACTIVE_GOALS, REACTIVATION_GRACE_DAYS } from "@/lib/limits";

/**
 * Admission control (REQ-010).
 *
 * Called by every path that can make a goal active, so the limit cannot be
 * bypassed through the UI, a server action, or a direct call. Reactivating a
 * goal parked within the last week is undo, not a new commitment.
 *
 * Note: read-then-write. Race-free in practice for a single user; strict
 * atomicity would need a transaction, and therefore a replica set.
 */
export async function assertGoalSlot(userId: string, nodeId?: string): Promise<void> {
  if (nodeId) {
    const node = await NodeModel.findOne({ _id: nodeId, userId }).lean();
    const parkedAt = (node as { parkedAt?: Date } | null)?.parkedAt;
    if (parkedAt) {
      const days = (Date.now() - new Date(parkedAt).getTime()) / 86_400_000;
      if (days <= REACTIVATION_GRACE_DAYS) return;
    }
  }

  const active = await NodeModel.countDocuments({
    userId,
    type: "year",
    status: "active",
  });

  if (active >= MAX_ACTIVE_GOALS) {
    throw new GoalLimitError(
      `You already have ${active} active goals. Park one before starting another.`,
    );
  }
}
