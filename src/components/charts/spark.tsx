"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const TONE_COLOR: Record<string, string> = {
  sky: "var(--color-sky)",
  mint: "var(--color-mint)",
  rose: "var(--color-rose)",
  amber: "var(--color-amber)",
  violet: "var(--color-violet)",
};

/** A small bar sparkline for a stat card's own week. */
export function Spark({
  values,
  tone,
  labels = ["M", "T", "W", "T", "F", "S", "S"],
}: {
  values: number[];
  tone: "sky" | "mint" | "rose" | "amber" | "violet";
  labels?: string[];
}) {
  const data = values.map((v, i) => ({ v, l: labels[i] ?? "" }));

  return (
    <div>
      <div className="h-[46px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="18%">
            <Bar dataKey="v" fill={TONE_COLOR[tone]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-1 mt-1.5">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center text-[9.5px] text-ink-faint">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * A single-series line with a filled area and the endpoint emphasised - the
 * one point worth a direct label, per the dataviz mark rules. The axis is a
 * real scale derived from the data (padded 15% top and bottom) rather than
 * hand-placed labels, so the three grid lines always mean what they say.
 */
export function LineChart({
  values,
  labels,
  unit = "",
  height = 120,
}: {
  values: number[];
  labels: string[];
  unit?: string;
  height?: number;
}) {
  const data = values.map((v, i) => ({ v, l: labels[i] }));
  const last = data[data.length - 1];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || max * 0.1 || 1;

  return (
    <figure className="m-0">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="l"
              tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[min - pad, max + pad]}
              tick={{ fontSize: 10.5, fill: "var(--color-ink-faint)" }}
              tickFormatter={(v: number) => `${Math.round(v)}${unit}`}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--color-brand)"
              strokeWidth={2}
              fill="var(--color-brand)"
              fillOpacity={0.1}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot
              x={last.l}
              y={last.v}
              r={4}
              fill="var(--color-brand)"
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** A labelled horizontal bar, for category and skill breakdowns. Not chart
 *  data proper - a single progress value - so it stays a styled div rather
 *  than a library chart with an axis it doesn't need. */
export function BarRow({
  label,
  pct,
  tone = "sky",
}: {
  label: string;
  pct: number;
  tone?: "sky" | "mint" | "amber" | "violet" | "rose" | "brand";
}) {
  const fill = {
    sky: "bg-sky",
    mint: "bg-mint",
    amber: "bg-amber",
    violet: "bg-violet",
    rose: "bg-rose",
    brand: "bg-brand",
  }[tone];

  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)_38px] items-center gap-3">
      <span className="text-[13px] text-ink-soft truncate">{label}</span>
      <span className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <span className={`block h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-[12px] font-semibold tnum text-ink-soft text-right">{pct}%</span>
    </div>
  );
}

/** A stat card with a delta against the previous period. Also not a chart. */
export function DeltaStat({
  label,
  value,
  delta,
  note = "vs last month",
}: {
  label: string;
  value: string;
  delta: number;
  note?: string;
}) {
  const up = delta >= 0;
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <p className="text-[12.5px] text-ink-soft">{label}</p>
      <p className="mt-1.5 text-[24px] font-extrabold tnum tracking-[-0.02em] leading-none">
        {value}
      </p>
      <p className={`mt-2 text-[12px] font-semibold tnum ${up ? "text-mint" : "text-rose"}`}>
        {up ? "↑" : "↓"} {Math.abs(delta)}%{" "}
        <span className="text-ink-faint font-medium">{note}</span>
      </p>
    </div>
  );
}
