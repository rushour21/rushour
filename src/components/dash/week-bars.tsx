"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";

/**
 * Emphasis pattern, per the dataviz mark rules: highlight the one bar that
 * matters (a full day, value 100) and gray the rest, rather than eight equal
 * hues competing for attention over a single-number story.
 *
 * A dedicated client component because Recharts (context/hooks internally)
 * can't be imported directly into a server component - Dashboard's page.tsx
 * has no "use client", so this boundary has to live here.
 */
export function WeekBars({ data }: { data: { day: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((b) => (
            <Cell key={b.day} fill="var(--color-brand)" fillOpacity={b.value === 100 ? 1 : 0.25} />
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
  );
}
