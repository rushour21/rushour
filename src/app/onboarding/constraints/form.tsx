"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorNote, Label } from "@/components/ui";
import { hm } from "@/lib/sample/data";
import { profileStore } from "@/lib/store/profile";

const FIELDS = [
  { name: "sleepTargetH", label: "Sleep target", step: 0.5, max: 12 },
  { name: "workH", label: "Work or study", step: 0.5, max: 16 },
  { name: "commuteH", label: "Commute", step: 0.25, max: 6 },
  { name: "mealsH", label: "Meals", step: 0.25, max: 6 },
  { name: "lifeH", label: "Everything else", step: 0.5, max: 10 },
] as const;

type Profile = Record<(typeof FIELDS)[number]["name"], number>;

export function ConstraintsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [values, setValues] = useState<Profile>(profile);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const committedH = FIELDS.reduce((n, f) => n + (values[f.name] || 0), 0);
  const freeH = 24 - committedH;
  const impossible = freeH <= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (impossible) return;
    setError(null);
    setPending(true);
    profileStore.update({
      sleepTargetH: values.sleepTargetH,
      workH: values.workH,
      commuteH: values.commuteH,
      mealsH: values.mealsH,
      lifeH: values.lifeH,
    });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {FIELDS.map((f) => (
          <div key={f.name} className="grid grid-cols-[1fr_7rem] items-center gap-4">
            <Label htmlFor={f.name}>{f.label}</Label>
            <div className="flex items-center gap-2">
              <input
                id={f.name}
                name={f.name}
                type="number"
                min={0}
                max={f.max}
                step={f.step}
                value={values[f.name]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: Number(e.target.value) }))
                }
                className="w-full bg-surface border border-rule rounded-[3px] px-3 py-2 font-mono text-[14px] tnum text-right outline-none focus:border-accent"
              />
              <span className="font-mono text-[11px] text-ink-faint">h</span>
            </div>
          </div>
        ))}
      </div>

      <Card tone={impossible ? "over" : freeH < 2 ? "hold" : "plain"} className="p-4">
        <p className="font-mono text-[11px] tracking-[0.11em] uppercase text-ink-faint mb-2">
          What is left
        </p>
        <p className="font-display text-[1.6rem] font-700 tnum leading-none">
          {impossible ? "None" : hm(Math.round(freeH * 60))}
        </p>
        <p className="mt-2 text-[13.5px] text-ink-soft">
          {impossible
            ? `Those add up to ${committedH} hours. There are 24 in a day.`
            : freeH < 2
              ? "That is a very full day. Rushour will plan small and hold you to it."
              : `${committedH}h committed, so this is the pool everything optional comes from — before any buffer.`}
        </p>
      </Card>

      <ErrorNote>{error}</ErrorNote>

      <Button type="submit" disabled={pending || impossible}>
        {pending ? "Saving…" : "Finish and clock in"}
      </Button>
    </form>
  );
}
