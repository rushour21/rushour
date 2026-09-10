"use client";

import { useState } from "react";
import { IconDots, IconPlus, IconX } from "@/components/app/icons";
import { goalProgress, type Goal } from "@/lib/sample/goals";
import { goalStore } from "@/lib/store/entities";
import { newId } from "@/lib/store/local-store";

const TONE = {
  sky: { wash: "bg-sky-soft/45", chip: "bg-sky-soft text-sky", bar: "bg-sky" },
  rose: { wash: "bg-mint-soft/45", chip: "bg-rose-soft text-rose", bar: "bg-mint" },
  amber: { wash: "bg-amber-soft/45", chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  violet: { wash: "bg-violet-soft/45", chip: "bg-violet-soft text-violet", bar: "bg-violet" },
};

const TAG_CHIP: Record<string, string> = {
  Career: "bg-sky-soft text-sky",
  Learning: "bg-amber-soft text-amber",
  Health: "bg-mint-soft text-mint",
  Personal: "bg-violet-soft text-violet",
};

/**
 * A year goal: the goal itself on a tinted field, and its milestone
 * checklist beside it. Progress is derived from the checklist rather than
 * stored, so it's always exactly what's been checked off - and checking
 * one off is how you "update a milestone".
 */
export function GoalCard({
  goal,
  icon,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  icon: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const t = TONE[goal.tone];
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const pct = goalProgress(goal);

  function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    goalStore.update(goal.id, {
      milestones: [...goal.milestones, { id: newId("ms"), title, done: false }],
    });
    setDraft("");
  }

  function toggleMilestone(id: string) {
    goalStore.update(goal.id, {
      milestones: goal.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    });
  }

  function removeMilestone(id: string) {
    goalStore.update(goal.id, {
      milestones: goal.milestones.filter((m) => m.id !== id),
    });
  }

  return (
    <article className="rounded-2xl border border-line bg-surface overflow-hidden shadow-[var(--shadow-card)] grid md:grid-cols-[minmax(0,1fr)_260px]">
      <div className={`p-5 ${t.wash}`}>
        <div className="flex gap-4">
          <span className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 bg-surface ${t.chip.split(" ")[1]}`}>
            {icon}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{goal.title}</h3>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-surface text-ink-soft shrink-0">
                Year Goal
              </span>

              {(onEdit || onDelete) && (
                <div className="relative ml-auto shrink-0">
                  <button
                    type="button"
                    aria-label={`More actions for ${goal.title}`}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                    className="text-ink-faint hover:text-ink"
                  >
                    <IconDots className="w-4 h-4" />
                  </button>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                      />
                      <div className="absolute z-50 right-0 top-full mt-1 w-36 bg-surface border border-line rounded-xl shadow-[var(--shadow-lift)] p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onEdit?.();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium hover:bg-surface-2 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onDelete?.();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium text-rose hover:bg-rose-soft transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">{goal.detail}</p>

            <div className="mt-3.5 flex items-center gap-3">
              <span className="flex-1 h-2 rounded-full bg-surface/70 overflow-hidden">
                <span className={`block h-full rounded-full ${t.bar}`} style={{ width: `${pct}%` }} />
              </span>
              <span className="text-[13px] font-bold tnum text-ink-soft shrink-0">{pct}%</span>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2">
              {goal.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${TAG_CHIP[tag] ?? "bg-surface text-ink-soft"}`}
                >
                  {tag}
                </span>
              ))}
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                  goal.priority === "High"
                    ? "bg-rose-soft text-rose"
                    : "bg-amber-soft text-amber"
                }`}
              >
                Priority: {goal.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-2.5 border-t md:border-t-0 md:border-l border-line">
        <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-ink-faint mb-0.5">
          Milestones ({goal.milestones.filter((m) => m.done).length} / {goal.milestones.length})
        </p>

        {goal.milestones.length === 0 && (
          <p className="text-[12.5px] text-ink-faint">No milestones yet - add the first step below.</p>
        )}

        <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto scroll-slim">
          {goal.milestones.map((m) => (
            <li key={m.id} className="flex items-center gap-2 group">
              <button
                type="button"
                role="checkbox"
                aria-checked={m.done}
                onClick={() => toggleMilestone(m.id)}
                className={`w-4 h-4 shrink-0 rounded-[5px] border grid place-items-center transition-colors ${
                  m.done ? `${t.bar} border-transparent` : "border-line-strong"
                }`}
              >
                {m.done && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 min-w-0 text-[13px] truncate ${m.done ? "line-through text-ink-faint" : ""}`}>
                {m.title}
              </span>
              <button
                type="button"
                aria-label={`Remove milestone ${m.title}`}
                onClick={() => removeMilestone(m.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose shrink-0 transition-opacity"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addMilestone} className="mt-1 flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a milestone"
            className="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-surface-2 border border-line text-[12.5px] outline-none focus:border-brand transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Add milestone"
            className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-brand-soft text-brand disabled:opacity-40 hover:opacity-80 transition-opacity"
          >
            <IconPlus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </article>
  );
}
