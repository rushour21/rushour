import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db/client";
import { User } from "@/lib/db/models";

export interface Ctx {
  userId: string;
  user: {
    _id: unknown;
    name: string;
    timezone: string;
    profile: { sleepTargetH: number; workH: number; commuteH: number; mealsH: number; lifeH: number };
    planning: { utilization: number; multiplier: number; multiplierN: number };
    readinessWeights: { sleep: number; energy: number; stress: number; recovery: number };
    onboarding: { identity: boolean; direction: boolean; constraints: boolean };
  };
}

/** Every action and page starts here. Redirects rather than throwing. */
export async function requireUser(): Promise<Ctx> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  await connectDb();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/sign-in");

  return { userId: session.user.id, user: user as unknown as Ctx["user"] };
}

/** Fixed daily commitments in minutes, from the profile. */
export function fixedMinutesPerDay(p: Ctx["user"]["profile"]): number {
  return Math.round((p.workH + p.commuteH + p.mealsH + p.lifeH) * 60);
}
