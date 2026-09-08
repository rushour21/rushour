import { requireUser } from "@/lib/actions/context";
import { buildWeeklyReview } from "@/lib/actions/review";
import { sessionDate } from "@/lib/time";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { OutcomeBar } from "@/components/outcome-bar";
import { FAILURE_REASONS, hm } from "@/lib/engine";
import { ApplyAdaptation } from "./apply";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const ctx = await requireUser();
  const today = sessionDate(ctx.user.timezone);
  const { stats, reasonHistogram, adaptation, narrative, sessionCount } =
    await buildWeeklyReview(today);

  const label = (v: string) =>
    FAILURE_REASONS.find((r) => r.value === v)?.label ?? v;

  return (
    <AppShell name={ctx.user.name} active="review">
      <div className="flex flex-col gap-7">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-ink-faint mb-2">
            This week
          </p>
          <h1 className="font-display text-[1.9rem] font-700 tracking-[-0.02em] leading-[1.1]">
            {sessionCount === 0 ? "Nothing sealed yet" : "What actually happened"}
          </h1>
        </div>

        {sessionCount === 0 ? (
          <p className="text-ink-soft text-[15px] max-w-[44ch]">
            Clock out at the end of a day and it appears here. Three closed days
            is enough for the app to name a pattern.
          </p>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint">
                  Planned against done
                </p>
                <p className="font-mono text-[11px] tnum text-ink-soft">
                  {sessionCount} {sessionCount === 1 ? "day" : "days"}
                </p>
              </div>
              <OutcomeBar plannedMin={stats.plannedMin} actualMin={stats.completedMin} />
              <p className="mt-3 font-mono text-[11.5px] tnum text-ink-soft">
                {stats.completedTasks} of {stats.plannedTasks} tasks ·{" "}
                {Math.round(stats.completionRate * 100)}%
              </p>
            </Card>

            {Object.keys(reasonHistogram).length > 0 && (
              <section>
                <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-3">
                  Why things did not finish
                </p>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(reasonHistogram)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => (
                      <div
                        key={reason}
                        className="flex items-center gap-3 py-2 border-b border-rule last:border-b-0"
                      >
                        <span className="text-[14.5px] flex-1">{label(reason)}</span>
                        <span
                          className="h-2 bg-accent/60 rounded-[1px]"
                          style={{
                            width: `${Math.max(8, (count / Math.max(...Object.values(reasonHistogram))) * 96)}px`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[12px] tnum w-5 text-right">{count}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {narrative && (
              <Card className="p-4 border-l-[3px] border-l-accent">
                <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-2">
                  Reading
                </p>
                <p className="text-[15px] leading-[1.55]">{narrative}</p>
              </Card>
            )}

            <Card tone={adaptation.adapted && adaptation.deltaPct < 0 ? "hold" : "plain"} className="p-4">
              <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-2">
                Next week
              </p>
              <p className="font-display font-600 text-[16px] mb-1">{adaptation.message}</p>
              <p className="font-mono text-[11px] tnum text-ink-faint mb-3">
                {adaptation.adapted &&
                  `utilisation ${Math.round(adaptation.previous * 100)}% → ${Math.round(adaptation.utilization * 100)}% · `}
                your estimates run {Math.round((stats.multiplierAfter - 1) * 100)}% long
              </p>
              <ApplyAdaptation
                utilization={adaptation.utilization}
                unchanged={!adaptation.adapted || adaptation.deltaPct === 0}
              />
            </Card>

            <p className="font-mono text-[10.5px] tnum text-ink-faint">
              {hm(stats.completedMin)} worked of {hm(stats.plannedMin)} planned
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
