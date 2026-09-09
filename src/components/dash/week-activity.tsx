"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import { taskStore } from "@/lib/store/entities";
import { useClockHistory } from "@/lib/store/clock";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The last 7 days, each bar showing whether a clock session was closed that
 * day - real consistency data, replacing a fabricated per-day completion
 * percentage that had no daily-granularity data behind it (tasks only carry
 * done: boolean, not a completion date, so a real per-day rate isn't
 * something this store can answer yet).
 */
export function WeekActivity() {
  const history = useClockHistory();
  const tasks = taskStore.useItems();
  const doneCount = tasks.filter((t) => t.done).length;

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const clockedDays = new Set(history.map((r) => localDateKey(new Date(r.clockOut))));

  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day: DOW[i], active: clockedDays.has(localDateKey(d)) ? 100 : 4 };
  });

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 min-w-0 h-[130px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="active" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.day} fill="var(--color-brand)" fillOpacity={d.active === 100 ? 1 : 0.15} />
              ))}
            </Bar>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[13px] shrink-0 text-right">
        <b className="font-bold tnum block text-[18px]">{doneCount}</b>
        <span className="text-ink-soft">tasks completed</span>
      </p>
    </div>
  );
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
