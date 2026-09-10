"use client";

import { QuoteCard } from "@/components/app/rail";
import { IconFlame, IconLeaf } from "@/components/app/icons";
import { habitStore } from "@/lib/store/entities";
import { habitStreak } from "@/lib/sample/habits";

/**
 * Real derived stats, replacing a fixed "Current Streak: 3, Longest
 * Streak: 12" pair and a fabricated correlation-style "Insights" list
 * ('you sleep 42 min later when you miss exercise') with no data behind
 * it. There's no honest way to compute that kind of insight yet, so it's
 * gone rather than faked - a single real best-current-streak stat replaces
 * both streak numbers, since there's no historical max being tracked.
 */
export function HabitsSidebar() {
  const habits = habitStore.useItems();
  const bestStreak = habits.reduce((max, h) => Math.max(max, habitStreak(h)), 0);

  return (
    <>
      <QuoteCard text="“We are what we repeatedly do.” — Aristotle" />

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-[15px] font-bold mb-4">Best Current Streak</h2>
        <div className="flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl grid place-items-center bg-amber-soft text-amber shrink-0">
            <IconFlame />
          </span>
          <div>
            <p className="text-[26px] font-extrabold tnum leading-none">{bestStreak}</p>
            <p className="text-[12px] text-ink-soft mt-1">
              {bestStreak === 1 ? "day" : "days"}, across any habit
            </p>
          </div>
        </div>

        {bestStreak > 0 && (
          <div className="mt-4 rounded-xl bg-mint-soft p-3.5 flex gap-2.5">
            <span className="text-mint shrink-0">
              <IconLeaf className="w-[18px] h-[18px]" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">
                You&rsquo;re on a {bestStreak}-day streak!
              </p>
              <p className="text-[12.5px] text-ink-soft mt-0.5">
                Keep going. Consistency compounds.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
