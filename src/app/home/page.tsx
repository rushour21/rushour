import { redirect } from "next/navigation";
import { requireUser } from "@/lib/actions/context";
import { dashboardData, WINDOW_DAYS } from "@/lib/actions/stats";
import { AppShell } from "@/components/shell";
import { StatTile } from "@/components/stat-tile";
import { PlannedVsDone, ReadinessTrend, ReasonBars } from "@/components/charts";
import { Card, Pill } from "@/components/ui";
import { StreakCard } from "./streak-card";
import { Achievements } from "./achievements";
import { DayState } from "./day-state";
import { hasEnoughEvidence, hm } from "@/lib/engine";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ctx = await requireUser();
  if (!ctx.user.onboarding.direction) redirect("/onboarding/direction");
  if (!ctx.user.onboarding.constraints) redirect("/onboarding/constraints");

  const data = await dashboardData(ctx);
  const { metrics: m, calibration, days } = data;
  const enough = hasEnoughEvidence(m.sealedDays);

  const points = days.map((d) => ({
    localDate: d.localDate,
    sealed: d.sealed,
    plannedMin: d.plannedMin,
    doneMin: d.doneMin,
    readinessScore: d.readinessScore,
  }));

  return (
    <AppShell name={ctx.user.name} active="home">
      <div className="flex flex-col gap-7">
        {/* The day comes before the numbers: Home answers "what now" first. */}
        <DayState today={data.today} firstName={ctx.user.name.split(" ")[0]} />

        <StreakCard streak={data.streak} level={data.level} />

        <section>
          <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint mb-3">
            Last {WINDOW_DAYS} days
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatTile
              label="Finished as planned"
              value={enough && m.completionRate !== null ? Math.round(m.completionRate * 100) : null}
              unit="%"
              note={`${m.onPlanDays} of ${m.sealedDays} days on plan`}
              empty={`${3 - m.sealedDays} more closed ${3 - m.sealedDays === 1 ? "day" : "days"} and this becomes meaningful.`}
              tone={enough && (m.completionRate ?? 0) >= 0.7 ? "good" : "plain"}
            />
            <StatTile
              label="Estimates run"
              value={calibration.confident ? `+${Math.round((calibration.multiplier - 1) * 100)}` : null}
              unit="%"
              note={`from ${calibration.n} real estimates`}
              empty={`Borrowing an average until you have ${5 - calibration.n} more estimates.`}
            />
            <StatTile
              label="Days shown up"
              value={m.sealedDays}
              unit={`/${m.windowDays}`}
              note={m.showUpRate !== null ? `${Math.round(m.showUpRate * 100)}% of days` : undefined}
              empty="Clock out once to start this."
            />
            <StatTile
              label="Worked"
              value={m.sealedDays > 0 ? hm(m.doneMin) : null}
              note={`against ${hm(m.plannedMin)} planned`}
              empty="Nothing closed yet."
            />
          </div>
        </section>

        {m.ambitionTrend === "shrinking" && (
          // The counter-metric that stops the north star being gamed.
          <Card tone="hold" className="p-4">
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-hold mb-2">
              Worth noticing
            </p>
            <p className="text-[14.5px] text-ink-soft">
              You are planning noticeably less than you were. If your completion
              rate is climbing, that is why — and it is not the same as getting
              more done.
            </p>
          </Card>
        )}

        <section>
          <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint mb-3">
            Worked against planned
          </p>
          <Card className="p-4">
            {m.sealedDays === 0 ? (
              <p className="text-[13.5px] text-ink-soft">
                Your first closed day draws the first bar here.
              </p>
            ) : (
              <PlannedVsDone days={points} />
            )}
          </Card>
        </section>

        <div className="grid sm:grid-cols-2 gap-4">
          <section>
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint mb-3">
              Readiness
            </p>
            <Card className="p-4">
              <ReadinessTrend days={points} />
            </Card>
          </section>

          <section>
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint mb-3">
              Why work did not finish
            </p>
            <Card className="p-4">
              <ReasonBars histogram={m.reasonHistogram} />
            </Card>
          </section>
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint">
              Goals
            </p>
            <Pill tone="neutral">
              {data.activeGoals.length} active · {data.laterCount} later
            </Pill>
          </div>
          <Card className="p-4">
            {data.activeGoals.length === 0 ? (
              <p className="text-[13.5px] text-ink-soft">Nothing active yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.activeGoals.map((g) => (
                  <div key={g.id} className="flex items-baseline justify-between gap-3">
                    <p className="font-display font-600 text-[15px] min-w-0 truncate">
                      {g.title}
                    </p>
                    {g.category && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint shrink-0">
                        {g.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <Achievements items={data.achievements} />
      </div>
    </AppShell>
  );
}
