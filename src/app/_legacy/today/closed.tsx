"use client";

import { useState, useTransition } from "react";
import { resumeSession } from "@/lib/actions/session";
import { Button, Card, ErrorNote, Pill } from "@/components/ui";
import { OutcomeBar } from "@/components/outcome-bar";
import { hm } from "@/lib/engine";

interface ClosedSession {
  state: "CLOSED" | "AUTO_CLOSED";
  tomorrow: string;
  plan: { outcome: string; items: { nodeId: string; title: string; estimateTarget: number }[] };
  actuals: { nodeId: string; actualMin: number; tierReached: string }[];
}

/**
 * The day after clock-out (REQ-022).
 *
 * Planned against actual as one bar, and no red: incomplete work is attributed
 * to a plan that was too big, never to the person. Nothing here can be edited -
 * the session is sealed, which is what makes the gap measurable at all.
 */
export function DayClosed({ session }: { session: ClosedSession }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const plannedMin = session.plan.items.reduce((n, i) => n + i.estimateTarget, 0);
  const actualMin = session.actuals.reduce((n, a) => n + a.actualMin, 0);
  const completed = session.actuals.filter((a) => a.tierReached !== "none").length;

  const auto = session.state === "AUTO_CLOSED";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone={auto ? "hold" : "neutral"}>
            {auto ? "Closed automatically" : "Day closed"}
          </Pill>
        </div>
        <h1 className="font-display text-[1.85rem] font-700 tracking-[-0.02em] leading-[1.1]">
          {session.plan.outcome}
        </h1>
      </div>

      {auto && (
        <Card tone="hold" className="p-4">
          <p className="text-[14.5px] text-ink-soft">
            You did not clock out, so this day closed on its own. It is not
            counted when working out how long your work takes.
          </p>
        </Card>
      )}

      <Card className="p-4">
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-3">
          Planned against done
        </p>
        <OutcomeBar plannedMin={plannedMin} actualMin={actualMin} />
        <p className="mt-3 font-mono text-[11.5px] tnum text-ink-soft">
          {completed} of {session.plan.items.length} tasks · {hm(actualMin)} worked
        </p>
      </Card>

      <div className="flex flex-col gap-2">
        {session.plan.items.map((item) => {
          const actual = session.actuals.find((a) => a.nodeId === item.nodeId);
          const reached = actual && actual.tierReached !== "none";
          return (
            <div
              key={item.nodeId}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-rule last:border-b-0"
            >
              <p className="text-[14.5px] min-w-0 truncate">{item.title}</p>
              <span className="font-mono text-[11px] tnum text-ink-soft shrink-0">
                {reached ? hm(actual!.actualMin) : "moved on"}
              </span>
            </div>
          );
        })}
      </div>

      {session.tomorrow && (
        <Card className="p-4 border-l-[3px] border-l-accent">
          <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-1.5">
            Tomorrow
          </p>
          <p className="font-display font-600 text-[15.5px]">{session.tomorrow}</p>
        </Card>
      )}

      <ErrorNote>{error}</ErrorNote>

      <Button
        variant="quiet"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await resumeSession();
            if (res?.error) setError(res.error);
          })
        }
      >
        {pending ? "Reopening…" : "Pick it back up"}
      </Button>
      <p className="-mt-3 text-[13px] text-ink-faint">
        Adds to today rather than starting a second day, so an evening stretch
        does not split the record.
      </p>
    </div>
  );
}
