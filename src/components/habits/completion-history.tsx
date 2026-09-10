"use client";

import { Select } from "@/components/app/bits";
import { BarSeries } from "@/components/charts/bar-series";
import { habitStore } from "@/lib/store/entities";
import { localDateKey } from "@/lib/sample/habits";

const DAYS = 30;

/** For each of the last 30 real days, the share of current habits marked
 *  done that day - replacing a fixed 30-value sample array with no
 *  connection to any actual habit history. */
export function CompletionHistory() {
  const habits = habitStore.useItems();

  const today = new Date();
  const values: number[] = [];
  const labels: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    const doneCount = habits.filter((h) => h.completedDates.includes(key)).length;
    values.push(habits.length === 0 ? 0 : Math.round((doneCount / habits.length) * 100));
    if (i === DAYS - 1 || i === Math.floor(DAYS / 2) || i === 0) {
      labels.push(d.toLocaleDateString(undefined, { day: "numeric", month: "short" }));
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[16px] font-bold">Habit Completion Rate</h2>
        <Select label="Last 30 days" />
      </div>
      {habits.length === 0 ? (
        <p className="text-[13.5px] text-ink-soft py-4 text-center">
          Add a habit to start tracking its completion history.
        </p>
      ) : (
        <BarSeries values={values} labels={labels} yTicks={["100%", "50%", "0%"]} />
      )}
    </section>
  );
}
