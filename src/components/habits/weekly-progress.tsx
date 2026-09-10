"use client";

import { IconArrow } from "@/components/app/icons";
import { WeekGrid } from "./week-grid";
import { habitStore } from "@/lib/store/entities";
import { localDateKey } from "@/lib/sample/habits";

/** This calendar week's real completion grid, replacing a fixed sample
 *  WEEK_GRID that had no connection to any actual habit. */
export function WeeklyProgress() {
  const habits = habitStore.useItems();

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const weekKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return localDateKey(d);
  });

  const rows = habits.map((h) => ({
    name: h.name,
    days: weekKeys.map((key) => h.completedDates.includes(key)),
  }));

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[16px] font-bold">Weekly Progress</h2>
        <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
          View Details
          <IconArrow className="w-4 h-4" />
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-[13.5px] text-ink-soft py-4 text-center">
          Add a habit to see its weekly grid here.
        </p>
      ) : (
        <WeekGrid rows={rows} />
      )}
    </section>
  );
}
