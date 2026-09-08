"use client";

import { useEffect, useState, useTransition } from "react";
import { commitPlan } from "@/lib/actions/session";
import { breakDownOutcome } from "@/lib/actions/plan";
import { Button, Card, ErrorNote, Label, Pill } from "@/components/ui";
import { CapacityBar } from "@/components/capacity-bar";
import { capacity, hm, type PlanItem } from "@/lib/engine";
import { REENTRY_CEILING } from "@/lib/limits";

interface SessionLite {
  _id: string;
  plannedClockOutAt: string;
  readiness: { band: "HIGH" | "MEDIUM" | "LOW"; score: number };
  capacity: { fixedMin: number; availableMin: number; bufferMin: number; windowMin: number };
  reentry: boolean;
}

interface Row {
  title: string;
  minimumMin: number;
  targetMin: number;
  stretchMin: number;
  goalId: string | null;
}

const emptyRow = (): Row => ({
  title: "",
  minimumMin: 15,
  targetMin: 60,
  stretchMin: 120,
  goalId: null,
});

/**
 * The plan screen. The capacity verdict recomputes on every keystroke because
 * the engine is pure TypeScript and runs in the browser — the server runs the
 * identical function as the authority when the plan is committed (REQ-032).
 */
export function PlanForm({
  session,
  multiplier,
  multiplierN,
  utilization,
  goals,
  aiAvailable,
  serverNow,
}: {
  session: SessionLite;
  multiplier: number;
  multiplierN: number;
  utilization: number;
  goals: { id: string; title: string }[];
  aiAvailable: boolean;
  /** The server's clock at render. Ticked locally rather than read during render. */
  serverNow: number;
}) {
  const [outcome, setOutcome] = useState("");
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [drift, setDrift] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDrift((d) => d + 30_000), 30_000);
    return () => clearInterval(t);
  }, []);

  const remainingMin = Math.max(
    30,
    Math.round(
      (new Date(session.plannedClockOutAt).getTime() - (serverNow + drift)) / 60_000,
    ),
  );

  const items: PlanItem[] = rows
    .filter((r) => r.title.trim().length >= 2)
    .map((r, i) => ({
      nodeId: String(i),
      title: r.title,
      estimateMin: { minimum: r.minimumMin, target: r.targetMin, stretch: r.stretchMin },
    }));

  const verdict = capacity({
    windowMin: remainingMin,
    fixedMin: session.capacity.fixedMin,
    items,
    multiplier,
    utilization: utilization * (session.reentry ? REENTRY_CEILING : 1),
    band: session.readiness.band,
  });

  function suggest() {
    if (!aiAvailable || outcome.trim().length < 3) return;
    setError(null);
    start(async () => {
      const tasks = await breakDownOutcome(outcome, verdict.availableMin);
      if (!tasks) {
        setError("Could not draft tasks just now — type them in yourself.");
        return;
      }
      setRows(
        tasks.map((t) => ({
          title: t.title,
          minimumMin: t.minimumMin,
          targetMin: t.targetMin,
          stretchMin: t.stretchMin,
          goalId: goals[0]?.id ?? null,
        })),
      );
    });
  }

  function commit() {
    setError(null);
    start(async () => {
      const res = await commitPlan({
        outcome,
        items: rows.filter((r) => r.title.trim().length >= 2),
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="accent">Clocked in</Pill>
          <Pill tone={session.readiness.band === "LOW" ? "hold" : "neutral"}>
            {session.readiness.band === "HIGH"
              ? "Full day"
              : session.readiness.band === "MEDIUM"
                ? "Moderate day"
                : "Light day"}
          </Pill>
          {session.reentry && <Pill tone="hold">Easing back in</Pill>}
        </div>
        <h1 className="font-display text-[1.9rem] font-700 tracking-[-0.02em] leading-[1.1]">
          What is today for?
        </h1>
        <p className="mt-2 text-ink-soft text-[15px]">
          One outcome. Everything you plan hangs off it.
        </p>
      </div>

      <div>
        <Label htmlFor="outcome">Today&rsquo;s outcome</Label>
        <input
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Finish refresh-token rotation"
          className="w-full bg-surface border border-rule rounded-[3px] px-3 py-3 font-display font-600 text-[16px] outline-none focus:border-accent placeholder:text-ink-faint placeholder:font-body placeholder:font-400"
        />
        {aiAvailable && (
          <button
            type="button"
            onClick={suggest}
            disabled={pending || outcome.trim().length < 3}
            className="mt-2 font-mono text-[11px] tracking-[0.06em] uppercase text-accent disabled:text-ink-faint"
          >
            {pending ? "Drafting…" : "Break this into tasks"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label>Tasks</Label>
          {multiplierN >= 5 ? (
            <span className="font-mono text-[10.5px] text-ink-faint tnum">
              your estimates run {Math.round((multiplier - 1) * 100)}% long
            </span>
          ) : (
            <span className="font-mono text-[10.5px] text-ink-faint tnum">
              using an estimated ×{multiplier} until you have a week of data
            </span>
          )}
        </div>

        {rows.map((row, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex gap-2 items-start">
              <input
                value={row.title}
                placeholder="Design the token flow"
                onChange={(e) =>
                  setRows((p) => p.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))
                }
                className="flex-1 min-w-0 bg-transparent font-display font-600 text-[15px] outline-none border-b border-transparent focus:border-rule pb-1"
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((p) => p.filter((_, j) => j !== i))}
                  aria-label={`Remove ${row.title || "task"}`}
                  className="font-mono text-[11px] text-ink-faint hover:text-over px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["minimumMin", "targetMin", "stretchMin"] as const).map((k, idx) => (
                <div key={k}>
                  <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-faint mb-1">
                    {["Minimum", "Target", "Stretch"][idx]}
                  </p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={600}
                      step={5}
                      value={row[k]}
                      aria-label={`${["Minimum", "Target", "Stretch"][idx]} minutes for ${row.title || "task"}`}
                      onChange={(e) =>
                        setRows((p) =>
                          p.map((r, j) => (j === i ? { ...r, [k]: Number(e.target.value) } : r)),
                        )
                      }
                      className={`w-full bg-surface-2 border rounded-[3px] px-2 py-1.5 font-mono text-[13px] tnum text-right outline-none focus:border-accent ${
                        idx === 1 ? "border-rule-strong" : "border-transparent"
                      }`}
                    />
                    <span className="font-mono text-[10px] text-ink-faint">m</span>
                  </div>
                </div>
              ))}
            </div>

            {row.targetMin > 0 && (
              <p className="mt-2 font-mono text-[10.5px] tnum text-ink-faint">
                you said {hm(row.targetMin)} — expect {hm(Math.round(row.targetMin * multiplier))}
              </p>
            )}
          </Card>
        ))}

        <button
          type="button"
          onClick={() => setRows((p) => [...p, emptyRow()])}
          className="self-start font-mono text-[11px] tracking-[0.06em] uppercase text-accent py-1"
        >
          + Add task
        </button>
      </div>

      <Card tone={verdict.overloaded ? "over" : "plain"} className="p-4">
        <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-3">
          Capacity
        </p>
        <CapacityBar availableMin={verdict.availableMin} demandMin={verdict.demandMin} />
        <p className="mt-3 font-mono text-[10.5px] tnum text-ink-faint">
          {hm(remainingMin)} left today − {hm(verdict.fixedMin)} committed −{" "}
          {hm(verdict.bufferMin)} buffer
        </p>
      </Card>

      <ErrorNote>{error}</ErrorNote>

      <Button
        onClick={commit}
        disabled={pending || verdict.overloaded || items.length === 0 || outcome.trim().length < 3}
        className="py-3.5 text-[15px]"
      >
        {verdict.overloaded
          ? `Over by ${hm(verdict.demandMin - verdict.availableMin)} — cut something`
          : pending
            ? "Committing…"
            : "Commit the day"}
      </Button>
    </div>
  );
}
