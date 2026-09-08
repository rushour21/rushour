"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { clockOut, startTask, stopTask } from "@/lib/actions/session";
import { Button, Card, ErrorNote, Pill } from "@/components/ui";
import { CapacityBar } from "@/components/capacity-bar";
import { FAILURE_REASONS, fitToWindow, hm, rank, type PlanItem } from "@/lib/engine";
import { RESCUE_THRESHOLD } from "@/lib/limits";

interface Segment {
  nodeId: string;
  startedAt: string;
  endedAt: string | null;
  suspect?: boolean;
}

interface SessionLite {
  _id: string;
  plannedClockOutAt: string;
  readiness: { band: "HIGH" | "MEDIUM" | "LOW"; score: number };
  capacity: { availableMin: number; demandMin: number };
  plan: {
    outcome: string;
    items: { nodeId: string; title: string; estimateTarget: number; estimateMinimum: number }[];
  };
  segments: Segment[];
  rescueOfferedAt: string | null;
}

export function ActiveSession({
  session,
  multiplier,
  serverNow,
}: {
  session: SessionLite;
  multiplier: number;
  /** The server's clock at render, so no impure read happens during render. */
  serverNow: number;
}) {
  const [drift, setDrift] = useState(0);
  const now = serverNow + drift;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [rescueDismissed, setRescueDismissed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDrift((d) => d + 15_000), 15_000);
    return () => clearInterval(t);
  }, []);

  const activeSegment = session.segments.find((s) => !s.endedAt) ?? null;

  const actualByNode = useMemo(() => {
    const map: Record<string, number> = {};
    for (const seg of session.segments) {
      const end = seg.endedAt ? new Date(seg.endedAt).getTime() : now;
      const min = Math.max(0, (end - new Date(seg.startedAt).getTime()) / 60_000);
      map[seg.nodeId] = (map[seg.nodeId] ?? 0) + min;
    }
    return map;
  }, [session.segments, now]);

  const remainingMin = Math.max(
    0,
    Math.round((new Date(session.plannedClockOutAt).getTime() - now) / 60_000),
  );

  const done = (nodeId: string) => (actualByNode[nodeId] ?? 0) > 0;

  const outstanding = session.plan.items.filter((i) => !done(i.nodeId));
  const remainingDemand = Math.round(
    outstanding.reduce((n, i) => n + i.estimateTarget, 0) * multiplier,
  );

  const needsRescue =
    !rescueDismissed &&
    !session.rescueOfferedAt &&
    remainingMin > 0 &&
    remainingDemand > remainingMin * RESCUE_THRESHOLD;

  const planItems: PlanItem[] = outstanding.map((i) => ({
    nodeId: i.nodeId,
    title: i.title,
    estimateMin: { minimum: i.estimateMinimum, target: i.estimateTarget, stretch: i.estimateTarget * 2 },
  }));

  const ranked = rank(planItems, {
    blockRemainingMin: remainingMin,
    multiplier,
    band: session.readiness.band,
  });
  const next = ranked[0] ?? null;

  if (closing) {
    return (
      <ClockOutForm
        session={session}
        actualByNode={actualByNode}
        onCancel={() => setClosing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="accent">Clocked in</Pill>
          <span className="font-mono text-[11px] tnum text-ink-soft">
            {hm(remainingMin)} left
          </span>
        </div>
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-1.5">
          Today&rsquo;s outcome
        </p>
        <h1 className="font-display text-[1.75rem] font-700 tracking-[-0.02em] leading-[1.15]">
          {session.plan.outcome}
        </h1>
      </div>

      {needsRescue && (
        <RescuePanel
          items={planItems}
          remainingMin={remainingMin}
          multiplier={multiplier}
          onDismiss={() => setRescueDismissed(true)}
        />
      )}

      {next && !activeSegment && (
        <Card tone="plain" className="p-4 border-l-[3px] border-l-accent">
          <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-2">
            Do this next
          </p>
          <p className="font-display font-600 text-[16px] mb-1">{next.item.title}</p>
          <p className="text-[13.5px] text-ink-soft mb-3">{next.reason}</p>
          <Button
            onClick={() => start(async () => void (await startTask(next.item.nodeId)))}
            disabled={pending}
          >
            Start
          </Button>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint">
          Plan
        </p>
        {session.plan.items.map((item) => {
          const isActive = activeSegment?.nodeId === item.nodeId;
          const spent = Math.round(actualByNode[item.nodeId] ?? 0);
          const hitMinimum = spent >= item.estimateMinimum;

          return (
            <Card key={item.nodeId} tone={isActive ? "ok" : "plain"} className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-600 text-[15px] leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] tnum text-ink-faint">
                    min {item.estimateMinimum}m · target {item.estimateTarget}m
                    {spent > 0 && ` · spent ${hm(spent)}`}
                  </p>
                  {spent > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {hitMinimum && <Pill tone="ok">Minimum met</Pill>}
                      {spent >= item.estimateTarget && <Pill tone="ok">Target met</Pill>}
                    </div>
                  )}
                </div>
                <Button
                  variant={isActive ? "quiet" : "primary"}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = isActive ? await stopTask() : await startTask(item.nodeId);
                      if (res?.error) setError(res.error);
                    })
                  }
                  className="shrink-0"
                >
                  {isActive ? "Stop" : "Start"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-3">
          Remaining
        </p>
        <CapacityBar availableMin={remainingMin} demandMin={remainingDemand} compact />
      </Card>

      <ErrorNote>{error}</ErrorNote>

      <Button variant="quiet" onClick={() => setClosing(true)} className="py-3.5 text-[15px]">
        Clock out
      </Button>
    </div>
  );
}

/**
 * Rescue (REQ-041). Changes what is surfaced for the rest of the day; the
 * committed plan stays sealed so the plan-versus-actual gap survives for review.
 */
function RescuePanel({
  items,
  remainingMin,
  multiplier,
  onDismiss,
}: {
  items: PlanItem[];
  remainingMin: number;
  multiplier: number;
  onDismiss: () => void;
}) {
  const { keep, defer } = fitToWindow(items, remainingMin, multiplier, "minimum");

  return (
    <Card tone="hold" className="p-4">
      <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-hold mb-2">
        More planned than time left
      </p>
      <p className="text-[14.5px] text-ink-soft mb-3">
        {hm(remainingMin)} left. Here is what fits at the minimum version of each.
      </p>

      <ul className="flex flex-col gap-1.5 mb-3">
        {keep.map((i) => (
          <li key={i.nodeId} className="font-display font-600 text-[14.5px]">
            {i.title}{" "}
            <span className="font-mono font-400 text-[11px] tnum text-ink-faint">
              {i.estimateMin.minimum}m
            </span>
          </li>
        ))}
      </ul>

      {defer.length > 0 && (
        <p className="text-[13.5px] text-ink-soft mb-3">
          Moving to tomorrow: {defer.map((d) => d.title).join(", ")}.
        </p>
      )}

      <Button variant="quiet" onClick={onDismiss}>
        Got it
      </Button>
    </Card>
  );
}

/** Clock out (REQ-022). 60 second budget: at most three corrections. */
function ClockOutForm({
  session,
  actualByNode,
  onCancel,
}: {
  session: SessionLite;
  actualByNode: Record<string, number>;
  onCancel: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tomorrow, setTomorrow] = useState("");
  const [rows, setRows] = useState(() =>
    session.plan.items.map((item) => {
      const spent = Math.round(actualByNode[item.nodeId] ?? 0);
      return {
        nodeId: item.nodeId,
        title: item.title,
        actualMin: spent,
        estimateMinimum: item.estimateMinimum,
        estimateTarget: item.estimateTarget,
        reason: null as string | null,
      };
    }),
  );

  function tierFor(actualMin: number, minimum: number, target: number) {
    if (actualMin <= 0) return "none" as const;
    if (actualMin >= target) return "target" as const;
    if (actualMin >= minimum) return "minimum" as const;
    return "none" as const;
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await clockOut({
        tomorrow,
        actuals: rows.map((r) => ({
          nodeId: r.nodeId,
          actualMin: r.actualMin,
          tierReached: tierFor(r.actualMin, r.estimateMinimum, r.estimateTarget),
          reason: r.reason ?? null,
        })),
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[1.75rem] font-700 tracking-[-0.02em] leading-[1.1]">
          Closing the day
        </h1>
        <p className="mt-2 text-ink-soft text-[15px]">
          Correct anything the timer got wrong. This is what teaches the app how
          long your work really takes.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => {
          const tier = tierFor(row.actualMin, row.estimateMinimum, row.estimateTarget);
          return (
            <Card key={row.nodeId} className="p-3.5">
              <div className="flex items-baseline justify-between gap-3 mb-2.5">
                <p className="font-display font-600 text-[15px] leading-snug min-w-0">
                  {row.title}
                </p>
                {tier !== "none" && (
                  <Pill tone="ok">{tier === "target" ? "Target" : "Minimum"}</Pill>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={Math.max(180, row.estimateTarget * 2)}
                  step={5}
                  value={row.actualMin}
                  aria-label={`Actual minutes on ${row.title}`}
                  onChange={(e) =>
                    setRows((p) =>
                      p.map((r, j) => (j === i ? { ...r, actualMin: Number(e.target.value) } : r)),
                    )
                  }
                  className="flex-1 accent-[var(--color-accent)]"
                />
                <span className="font-mono text-[13px] tnum w-16 text-right">
                  {hm(row.actualMin)}
                </span>
              </div>

              {tier === "none" && (
                <div className="mt-3">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-faint mb-1.5">
                    What happened?
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FAILURE_REASONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() =>
                          setRows((p) =>
                            p.map((x, j) =>
                              j === i
                                ? { ...x, reason: x.reason === r.value ? null : r.value }
                                : x,
                            ),
                          )
                        }
                        aria-pressed={row.reason === r.value}
                        className={`font-mono text-[10.5px] px-2.5 py-1.5 rounded-[3px] border transition-colors ${
                          row.reason === r.value
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-rule text-ink-soft hover:border-rule-strong"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div>
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-1.5">
          Tomorrow&rsquo;s one thing <span className="normal-case tracking-normal">(optional)</span>
        </p>
        <input
          value={tomorrow}
          onChange={(e) => setTomorrow(e.target.value)}
          placeholder="Write the failure-case tests"
          className="w-full bg-surface border border-rule rounded-[3px] px-3 py-2.5 text-[15px] outline-none focus:border-accent placeholder:text-ink-faint"
        />
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex gap-3">
        <Button onClick={submit} disabled={pending} className="flex-1 py-3.5 text-[15px]">
          {pending ? "Closing…" : "Clock out"}
        </Button>
        <Button variant="quiet" onClick={onCancel} disabled={pending}>
          Back
        </Button>
      </div>
    </div>
  );
}
