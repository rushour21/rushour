"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

/**
 * A dense bar series over a date range. One hue: the bars encode magnitude,
 * and colouring them by height would spend the colour channel on information
 * the height already carries.
 *
 * `labels` may be sparser than `values` (a handful of date labels under many
 * bars) - they're spread evenly across the real index range rather than
 * shown one-per-bar, which would crowd illegibly at this density.
 */
export function BarSeries({
  values,
  labels,
  yTicks,
  height = 120,
}: {
  values: number[];
  labels: string[];
  yTicks?: string[];
  height?: number;
}) {
  const data = values.map((v, i) => ({ i, v }));

  const tickIndices =
    labels.length <= 1
      ? [0]
      : labels.map((_, li) => Math.round((li / (labels.length - 1)) * (values.length - 1)));
  const labelAt = new Map(tickIndices.map((idx, li) => [idx, labels[li]]));

  const max = Math.max(...values, 1);
  const yDomain = yTicks
    ? [0, max]
    : undefined;

  return (
    <figure className="m-0">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="12%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <XAxis dataKey="i" ticks={tickIndices} tickFormatter={(i: number) => labelAt.get(i) ?? ""} tickLine={false} axisLine={false} tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }} />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Bar dataKey="v" fill="var(--color-brand)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
