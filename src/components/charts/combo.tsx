"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";

/**
 * Bars for a count, a line for a duration.
 *
 * Both series share one YAxis rather than each getting its own scale: a
 * second y-scale lets the two curves be aligned arbitrarily, which invents a
 * correlation that isn't in the data. Recharts renders whatever the true
 * relative magnitude is - if that makes the line look flat next to the bars,
 * that flatness is the honest picture, not a chart bug.
 */
export function ComboChart({
  data,
  labels,
  height = 150,
}: {
  data: { tasks: number; focus: number }[];
  labels: string[];
  height?: number;
}) {
  const chartData = data.map((d, i) => ({ ...d, i }));

  const tickIndices =
    labels.length <= 1
      ? [0]
      : labels.map((_, li) => Math.round((li / (labels.length - 1)) * (data.length - 1)));
  const labelAt = new Map(tickIndices.map((idx, li) => [idx, labels[li]]));

  return (
    <figure className="m-0">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="i"
              ticks={tickIndices}
              tickFormatter={(i: number) => labelAt.get(i) ?? ""}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }}
            />
            <YAxis tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }} tickLine={false} axisLine={false} width={28} />
            <Bar dataKey="tasks" fill="var(--color-brand)" fillOpacity={0.28} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="focus"
              stroke="var(--color-sky)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
