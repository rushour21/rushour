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
