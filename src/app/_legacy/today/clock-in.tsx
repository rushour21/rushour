"use client";

import { useActionState, useState } from "react";
import { clockIn } from "@/lib/actions/session";
import { Button, Card, ErrorNote, Label } from "@/components/ui";
import { readiness } from "@/lib/engine";

/**
 * Clock in (REQ-020). Three readiness inputs and a planned finish time.
 * Nothing else is ever added to this screen — it has a 90 second budget.
 */
export function ClockIn({
  firstName,
  defaultClockOut,
  defaultSleep,
  sleepTarget,
  gapDays,
  isFirstEver,
}: {
  firstName: string;
  defaultClockOut: string;
  defaultSleep: number;
  sleepTarget: number;
  gapDays: number;
  isFirstEver: boolean;
}) {
  const [state, action, pending] = useActionState(clockIn, undefined);
  const [sleep, setSleep] = useState(defaultSleep);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);

  // The same engine function the server will run. This is a preview only.
  const r = readiness({
    sleepHours: sleep,
    sleepTargetHours: sleepTarget,
    energy,
    stress,
  });

  const lapsed = gapDays >= 3;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-ink-faint mb-2">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display text-[2rem] font-700 tracking-[-0.02em] leading-[1.1]">
          {lapsed ? "Welcome back." : `Morning, ${firstName}.`}
        </h1>
        {lapsed && (
          // Lapse re-entry (REQ-042): no backlog, no statistics, no streak talk.
          <p className="mt-2 text-ink-soft text-[15px] max-w-[42ch]">
            Nothing is waiting for you. Today is planned smaller than usual on
            purpose — pick one thing.
          </p>
        )}
        {isFirstEver && (
          <p className="mt-2 text-ink-soft text-[15px] max-w-[42ch]">
            Rushour starts with an estimate of how much people usually
            underestimate, and replaces it with yours after a week or so.
          </p>
        )}
      </div>

      <form action={action} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="sleepHours">Hours slept</Label>
          <div className="flex items-center gap-3">
            <input
              id="sleepHours"
              name="sleepHours"
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]"
            />
            <span className="font-mono text-[15px] tnum w-14 text-right">{sleep}h</span>
          </div>
        </div>

        <Scale label="Energy" name="energy" value={energy} onChange={setEnergy} lowLabel="Empty" highLabel="Sharp" />
        <Scale label="Stress" name="stress" value={stress} onChange={setStress} lowLabel="Calm" highLabel="Wired" />

        <div>
          <Label htmlFor="plannedClockOut">Finishing at</Label>
          <input
            id="plannedClockOut"
            name="plannedClockOut"
            type="time"
            defaultValue={defaultClockOut}
            required
            className="bg-surface border border-rule rounded-[3px] px-3 py-2.5 font-mono text-[15px] tnum outline-none focus:border-accent"
          />
          <p className="mt-1.5 text-[13px] text-ink-faint">
            This sets today&rsquo;s capacity. You can clock out earlier or later.
          </p>
        </div>

        <Card
          tone={r.band === "LOW" ? "hold" : r.band === "HIGH" ? "ok" : "plain"}
          className="p-4"
        >
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint">
              Readiness
            </p>
            <p className="font-mono text-[11px] tnum text-ink-soft">{r.score}/100</p>
          </div>
          <p className="font-display text-[1.35rem] font-700 leading-none mb-2">
            {r.band === "HIGH" ? "Full day" : r.band === "MEDIUM" ? "Moderate day" : "Light day"}
          </p>
          <p className="text-[13.5px] text-ink-soft">
            {r.band === "LOW"
              ? "Today is planned at just over half your usual load, and every task drops to its minimum version."
              : r.band === "MEDIUM"
                ? "Today is planned at 80% of your usual load."
                : "Today is planned at your full usual load."}
          </p>
          <p className="mt-3 font-mono text-[11px] tnum text-ink-faint">
            sleep {r.components.sleep} · energy {r.components.energy} · stress{" "}
            {r.components.stress}
            {r.components.recovery !== null && ` · recovery ${r.components.recovery}`}
          </p>
        </Card>

        <ErrorNote>{state?.error}</ErrorNote>

        <Button type="submit" disabled={pending} className="py-3.5 text-[15px]">
          {pending ? "Starting…" : "Clock in"}
        </Button>
      </form>
    </div>
  );
}

function Scale({
  label,
  name,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            aria-label={`${label} ${n} of 5`}
            className={`flex-1 py-2.5 rounded-[3px] border font-mono text-[13px] tnum transition-colors ${
              value === n
                ? "border-accent bg-accent-soft text-accent font-700"
                : "border-rule text-ink-soft hover:border-rule-strong"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
          {lowLabel}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
          {highLabel}
        </span>
      </div>
    </div>
  );
}
