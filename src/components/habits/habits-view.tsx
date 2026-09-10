"use client";

import { useState } from "react";
import { HabitRow } from "./habit-row";
import { HabitForm } from "./habit-form";
import { ConfirmDialog } from "@/components/app/modal";
import { Button } from "@/components/app/bits";
import { IconChevronLeft, IconChevronRight, IconDots, IconPlus } from "@/components/app/icons";
import { habitStore } from "@/lib/store/entities";
import { habitCompletionPct, habitStreak, localDateKey, type Habit } from "@/lib/sample/habits";

const GOAL_CHIP = {
  mint: "bg-mint-soft text-mint",
  sky: "bg-sky-soft text-sky",
  amber: "bg-amber-soft text-amber",
  violet: "bg-violet-soft text-violet",
};

/** Today's habit list plus the full table, both reading the same live store. */
export function HabitsView() {
  const habits = habitStore.useItems();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();
  const [deleting, setDeleting] = useState<Habit | undefined>();
  const [menuFor, setMenuFor] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-ink-faint">
            Habits
          </p>
          <h1 className="mt-2 text-[28px] sm:text-[32px] font-extrabold tracking-[-0.03em] leading-[1.1] text-balance">
            Build a better you, one habit at a time.
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">
            Consistency today creates the life you want tomorrow.
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="w-[18px] h-[18px]" />
          Add Habit
        </Button>
      </div>

      <section className="rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 px-5 pt-4.5 pb-2">
          <h2 className="text-[16px] font-bold">Today&rsquo;s Habits</h2>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-ink-soft" suppressHydrationWarning>
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              aria-label="Previous day"
              className="w-8 h-8 grid place-items-center rounded-lg border border-line text-ink-soft hover:bg-surface-2"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Next day"
              className="w-8 h-8 grid place-items-center rounded-lg border border-line text-ink-soft hover:bg-surface-2"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <ul className="px-5 pb-4">
          {habits.length === 0 && (
            <li className="py-8 text-center text-[13.5px] text-ink-soft">
              No habits yet. Add one to start tracking.
            </li>
          )}
          {habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              onToggle={() => {
                const today = localDateKey(new Date());
                const has = h.completedDates.includes(today);
                habitStore.update(h.id, {
                  completedDates: has
                    ? h.completedDates.filter((d) => d !== today)
                    : [...h.completedDates, today],
                });
              }}
              onEdit={() => {
                setEditing(h);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(h)}
            />
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4.5 pb-3">
          <h2 className="text-[16px] font-bold">All Habits</h2>
        </div>

        <div className="overflow-x-auto scroll-slim">
          <table className="w-full min-w-[680px] text-[14px]">
            <thead>
              <tr className="text-left text-[12px] font-semibold text-ink-soft border-y border-line bg-surface-2/50">
                <th className="px-5 py-2.5 font-semibold">Habit</th>
                <th className="px-3 py-2.5 font-semibold">Frequency</th>
                <th className="px-3 py-2.5 font-semibold">Current Streak</th>
                <th className="px-3 py-2.5 font-semibold">30-Day Completion</th>
                <th className="px-3 py-2.5 font-semibold">Goal Link</th>
                <th className="px-5 py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-semibold">{h.name}</td>
                  <td className="px-3 py-3 text-ink-soft">{h.frequency}</td>
                  <td className="px-3 py-3 tnum text-ink-soft">
                    {habitStreak(h)} {habitStreak(h) === 1 ? "day" : "days"}
                  </td>
                  <td className="px-3 py-3 tnum text-ink-soft">{habitCompletionPct(h, 30)}%</td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${GOAL_CHIP[h.goal.tone]}`}>
                      {h.goal.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        aria-label={`Actions for ${h.name}`}
                        aria-expanded={menuFor === h.id}
                        onClick={() => setMenuFor((m) => (m === h.id ? null : h.id))}
                        className="text-ink-faint hover:text-ink"
                      >
                        <IconDots className="w-4 h-4" />
                      </button>
                      {menuFor === h.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuFor(null)}
                            aria-hidden="true"
                          />
                          <div className="absolute z-50 right-0 top-full mt-1 w-36 bg-surface border border-line rounded-xl shadow-[var(--shadow-lift)] p-1 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuFor(null);
                                setEditing(h);
                                setFormOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium hover:bg-surface-2 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuFor(null);
                                setDeleting(h);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium text-rose hover:bg-rose-soft transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <HabitForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(h) => (editing ? habitStore.update(h.id, h) : habitStore.add(h))}
        habit={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        onConfirm={() => deleting && habitStore.remove(deleting.id)}
        title="Delete habit?"
        body={`"${deleting?.name ?? ""}" and its tracking history will be removed. This can't be undone.`}
      />
    </>
  );
}
