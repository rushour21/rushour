"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { draftDirection } from "@/lib/actions/onboarding";
import { Button, Card, ErrorNote, Label, Pill } from "@/components/ui";
import { goalStore } from "@/lib/store/entities";
import { newId } from "@/lib/store/local-store";

const TONES = ["sky", "rose", "amber", "violet"] as const;
const MAX_ACTIVE_GOALS = 2;

const CATEGORIES = [
  "Career",
  "Learning",
  "Health",
  "Fitness",
  "Finance",
  "Relationships",
  "Personal",
];

interface Draft {
  title: string;
  category: string;
  active: boolean;
}

export function DirectionForm({ aiAvailable }: { aiAvailable: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const activeCount = drafts?.filter((d) => d.active).length ?? 0;

  function toggleCategory(c: string) {
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }

  function generate() {
    setError(null);
    start(async () => {
      const goals = aiAvailable ? await draftDirection(text, selected) : null;
      const drafted = goals?.map((g) => ({
        title: g.title,
        category: g.category,
        active: false,
      }));
      // No model, or it failed: the same shape, typed by hand. Always at least
      // one row, or the user reaches a screen with nothing to fill in.
      const manual = selected.length
        ? selected.slice(0, 3).map((c) => ({ title: "", category: c, active: false }))
        : [{ title: "", category: "", active: false }];
      setDrafts(drafted?.length ? drafted : manual);
    });
  }

  function save() {
    setError(null);
    const cleaned = (drafts ?? []).filter((d) => d.title.trim().length >= 3);
    if (cleaned.length === 0) {
      setError("Write at least one goal.");
      return;
    }

    const active = cleaned.filter((d) => d.active);
    if (active.length === 0) {
      setError("Choose at least one goal to work on now.");
      return;
    }
    if (active.length > MAX_ACTIVE_GOALS) {
      setError(
        `Choose at most ${MAX_ACTIVE_GOALS}. Everything else goes to Later — you can promote it once one is finished.`,
      );
      return;
    }

    // Only the ones chosen to work on now become real goals: "Later" has no
    // home in the app yet (no backlog view), so saving it would just be
    // silent data nobody could ever see again.
    active.forEach((d) => {
      goalStore.add({
        id: newId("goal"),
        title: d.title.trim(),
        detail: "",
        tags: d.category ? [d.category] : [],
        priority: "Medium",
        milestones: [],
        tone: TONES[Math.floor(Math.random() * TONES.length)],
      });
    });

    router.push("/onboarding/constraints");
  }

  if (drafts) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Label>Choose at most two to work on now</Label>
          <p className="text-[14px] text-ink-soft">
            The rest go to Later. You can promote one the moment another finishes.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {drafts.map((d, i) => (
            <Card key={i} tone={d.active ? "ok" : "plain"} className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={d.active}
                  aria-label={`Work on ${d.title || "this goal"} now`}
                  disabled={!d.active && activeCount >= 2}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev!.map((x, j) => (j === i ? { ...x, active: e.target.checked } : x)),
                    )
                  }
                  className="mt-1.5 size-4 accent-[var(--color-accent)]"
                />
                <div className="flex-1 min-w-0">
                  <input
                    value={d.title}
                    placeholder="Become a stronger backend engineer"
                    onChange={(e) =>
                      setDrafts((prev) =>
                        prev!.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                    className="w-full bg-transparent font-display font-600 text-[15px] outline-none border-b border-transparent focus:border-rule pb-1"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Pill tone={d.active ? "ok" : "neutral"}>
                      {d.active ? "Active now" : "Later"}
                    </Pill>
                    {d.category && <Pill>{d.category}</Pill>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setDrafts((prev) => [...prev!, { title: "", category: "", active: false }])
          }
          className="self-start font-mono text-[11px] tracking-[0.06em] uppercase text-accent py-1"
        >
          + Add another
        </button>

        <p className="font-mono text-[11.5px] text-ink-faint tnum">
          {activeCount} of 2 active slots used
        </p>

        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-3">
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save and continue"}
          </Button>
          <Button variant="quiet" onClick={() => setDrafts(null)} disabled={pending}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="direction">In your own words</Label>
        <textarea
          id="direction"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="I want to get properly good at backend engineering, land a senior role, and stop wrecking my sleep."
          className="w-full bg-surface border border-rule rounded-[3px] px-3 py-2.5 text-[15px] font-body outline-none focus:border-accent placeholder:text-ink-faint"
        />
      </div>

      <div>
        <Label>Areas</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              aria-pressed={selected.includes(c)}
              className={`font-mono text-[11px] tracking-[0.06em] uppercase px-3 py-2 rounded-[3px] border transition-colors ${
                selected.includes(c)
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-rule text-ink-soft hover:border-rule-strong"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>
      <Button onClick={generate} disabled={pending || (!text.trim() && selected.length === 0)}>
        {pending ? "Working…" : aiAvailable ? "Turn this into goals" : "Continue"}
      </Button>
      {!aiAvailable && (
        <p className="text-[13px] text-ink-faint -mt-3">
          No model key configured, so you will write the goals yourself on the next screen.
        </p>
      )}
    </div>
  );
}
