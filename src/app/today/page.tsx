import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db/client";
import { NodeModel, SessionModel } from "@/lib/db/models";
import { requireUser } from "@/lib/actions/context";
import { nowMs } from "@/lib/clock";
import { atLocalTime, daysBetween, sessionDate } from "@/lib/time";
import { AppShell } from "@/components/shell";
import { ClockIn } from "./clock-in";
import { ActiveSession } from "./active";
import { DayClosed } from "./closed";
import { PlanForm } from "./plan-form";
import { aiEnabled } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const ctx = await requireUser();
  if (!ctx.user.onboarding.direction) redirect("/onboarding/direction");
  if (!ctx.user.onboarding.constraints) redirect("/onboarding/constraints");

  await connectDb();

  const today = sessionDate(ctx.user.timezone);
  const session = await SessionModel.findOne({
    userId: ctx.userId,
    localDate: today,
  }).lean();

  const goals = await NodeModel.find({
    userId: ctx.userId,
    type: "year",
    status: "active",
  })
    .select("_id title weight")
    .lean();

  const goalOptions = (goals as unknown as { _id: unknown; title: string }[]).map((g) => ({
    id: String(g._id),
    title: g.title,
  }));

  if (!session) {
    const last = await SessionModel.findOne({ userId: ctx.userId })
      .sort({ localDate: -1 })
      .select("localDate plannedClockOutAt readiness")
      .lean();

    const lastDoc = last as unknown as {
      localDate: string;
      plannedClockOutAt: Date;
      readiness?: { sleepH?: number };
    } | null;

    const gapDays = lastDoc ? daysBetween(lastDoc.localDate, today) : 0;

    return (
      <AppShell name={ctx.user.name} active="today">
        <ClockIn
          firstName={ctx.user.name.split(" ")[0]}
          defaultClockOut={defaultClockOut(lastDoc?.plannedClockOutAt, ctx.user.timezone)}
          defaultSleep={lastDoc?.readiness?.sleepH ?? ctx.user.profile.sleepTargetH}
          sleepTarget={ctx.user.profile.sleepTargetH}
          gapDays={gapDays}
          isFirstEver={!lastDoc}
        />
      </AppShell>
    );
  }

  const plain = JSON.parse(JSON.stringify(session));

  if (!plain.plan?.committedAt) {
    return (
      <AppShell name={ctx.user.name} active="today">
        <PlanForm
          session={plain}
          multiplier={ctx.user.planning.multiplier}
          multiplierN={ctx.user.planning.multiplierN}
          utilization={ctx.user.planning.utilization}
          goals={goalOptions}
          aiAvailable={aiEnabled()}
          serverNow={nowMs()}
        />
      </AppShell>
    );
  }

  if (plain.state === "CLOSED" || plain.state === "AUTO_CLOSED") {
    return (
      <AppShell name={ctx.user.name} active="today">
        <DayClosed session={plain} />
      </AppShell>
    );
  }

  return (
    <AppShell name={ctx.user.name} active="today">
      <ActiveSession
        session={plain}
        multiplier={ctx.user.planning.multiplier}
        serverNow={nowMs()}
      />
    </AppShell>
  );
}

/**
 * Prefilled from the last session's planned clock-out (REQ-020). If that hour
 * has already passed, prefilling it would silently propose finishing tomorrow
 * evening - so fall back to three hours from now.
 *
 * Compared as instants: "18:00" vs "01:15" as strings gets the wrong answer
 * whenever three hours from now crosses midnight.
 */
function defaultClockOut(last: Date | undefined, tz: string): string {
  const now = new Date();
  const historical = last ? formatLocal(last, tz) : "18:00";
  const candidate = atLocalTime(tz, historical, now);

  const stillUseful = candidate.getTime() > now.getTime() + 30 * 60_000;
  return stillUseful
    ? historical
    : formatLocal(new Date(now.getTime() + 3 * 3600_000), tz);
}

function formatLocal(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
