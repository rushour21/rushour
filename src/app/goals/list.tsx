"use client";

import { useActionState, useState, useTransition } from "react";
import { activateGoal, createGoal, parkGoal } from "@/lib/actions/goals";
import { Button, Card, ErrorNote, Field, Label, Pill } from "@/components/ui";

interface Goal {
  _id: string;
  title: string;
  category: string;
  status: string;
  weight: number;
}

export function GoalList({ goals, maxActive }: { goals: Goal[]; maxActive: number }) {
  const [state, action, pending] = useActionState(createGoal, undefined);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const active = goals.filter((g) => g.status === "active");
  const later = goals.filter((g) => g.status === "later");
  const parked = goals.filter((g) => g.status === "parked");
  const full = active.length >= maxActive;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[1.9rem] font-700 tracking-[-0.02em] leading-[1.1] mb-2">
          Goals
        </h1>
        <p className="text-ink-soft text-[15px] max-w-[44ch]">
          Two active at a time. Not a guideline — the app will refuse a third.
        </p>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint">
            Active
          </p>
          <p className="font-mono text-[10.5px] tnum text-ink-faint">
            {active.length} of {maxActive}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {active.length === 0 && (
            <p className="text-[14.5px] text-ink-soft">Nothing active yet.</p>
          )}
          {active.map((g) => (
            <Card key={g._id} tone="ok" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-600 text-[15.5px] leading-snug">{g.title}</p>
                  {g.category && (
                    <div className="mt-2">
                      <Pill>{g.category}</Pill>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => start(async () => void (await parkGoal(g._id)))}
                  disabled={busy}
                  className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-ink-soft hover:text-ink shrink-0"
                >
                  Park
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {(later.length > 0 || parked.length > 0) && (
        <section>
          <p className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint mb-1">
            Later
          </p>
          <p className="text-[13.5px] text-ink-soft mb-3">
            Filed, not lost. Never shown on a plan or in a notification.
          </p>

          <div className="flex flex-col gap-1.5">
            {[...later, ...parked].map((g) => (
              <div
                key={g._id}
                className="flex items-center justify-between gap-3 py-2.5 px-3 border-b border-rule last:border-b-0"
              >
                <p className="text-[14.5px] text-ink-soft min-w-0 truncate">{g.title}</p>
                <button
                  onClick={() =>
                    start(async () => {
                      const res = await activateGoal(g._id);
                      if (res?.error) setError(res.error);
                    })
                  }
                  disabled={busy || full}
                  className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-accent disabled:text-ink-faint shrink-0"
                >
                  {full ? "Slots full" : "Promote"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <ErrorNote>{error}</ErrorNote>

      <section>
        {adding ? (
          <form action={action} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="title">Goal</Label>
              <Field id="title" name="title" required placeholder="Become a stronger backend engineer" />
            </div>
            <div>
              <Label htmlFor="category">Area</Label>
              <Field id="category" name="category" placeholder="Career" />
            </div>
            <input type="hidden" name="status" value={full ? "later" : "active"} />
            {full && (
              <p className="text-[13.5px] text-ink-soft">
                Both active slots are taken, so this goes to Later.
              </p>
            )}
            <ErrorNote>{state?.error}</ErrorNote>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : full ? "File for later" : "Add goal"}
              </Button>
              <Button type="button" variant="quiet" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="quiet" onClick={() => setAdding(true)}>
            Add a goal
          </Button>
        )}
      </section>
    </div>
  );
}
