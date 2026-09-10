"use client";

import { IconTarget } from "@/components/app/icons";
import { goalStore } from "@/lib/store/entities";
import { goalDone } from "@/lib/sample/goals";

/**
 * Real derived stats, replacing what used to be a fixed "58% complete, 3 on
 * track / 1 at risk / 1 behind" breakdown, a fabricated "System Design
 * Skills - planned 8 sessions but completed 3" risk card, and a hardcoded
 * "AI Suggestion" that wasn't calling any AI. None of that had underlying
 * data to be honest about, so it's gone rather than faked.
 */
export function GoalsSidebar() {
  const goals = goalStore.useItems();
  const active = goals.filter((g) => !goalDone(g));

  const allMilestones = goals.flatMap((g) => g.milestones);
  const doneMilestones = allMilestones.filter((m) => m.done).length;
  const milestonePct =
    allMilestones.length === 0 ? 0 : Math.round((doneMilestones / allMilestones.length) * 100);

  const next = goals
    .flatMap((g) => g.milestones.filter((m) => !m.done).map((m) => ({ goal: g.title, milestone: m })))
    .slice(0, 5);

  return (
    <>
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold">Active Goals</p>
          <p className="text-[32px] font-extrabold tnum leading-none mt-2">{active.length}</p>
          <p className="text-[13px] text-ink-soft mt-1.5">
            Out of {goals.length} total {goals.length === 1 ? "goal" : "goals"}
          </p>
        </div>
        <span className="w-11 h-11 rounded-xl grid place-items-center bg-sky-soft text-sky shrink-0">
          <IconTarget />
        </span>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold">Milestones Completed</p>
            <p className="text-[32px] font-extrabold tnum leading-none mt-2">
              {doneMilestones} / {allMilestones.length}
            </p>
          </div>
          <span className="w-11 h-11 rounded-xl grid place-items-center bg-violet-soft text-violet shrink-0">
            <IconTarget />
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <span className="block h-full rounded-full bg-mint" style={{ width: `${milestonePct}%` }} />
          </span>
          <span className="text-[12px] font-bold tnum text-ink-soft">{milestonePct}%</span>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-[15px] font-bold mb-3.5">Next milestones</h2>
        {next.length === 0 ? (
          <p className="text-[13px] text-ink-soft">
            Nothing outstanding. Add a milestone to a goal to see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {next.map(({ goal, milestone }) => (
              <li key={milestone.id} className="min-w-0">
                <p className="text-[13.5px] font-semibold truncate">{milestone.title}</p>
                <p className="text-[11.5px] text-ink-faint truncate">{goal}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
