"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

/** Segmented filter pills. One row, above the content they filter. */
export function TabPills({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value?: string;
  onChange?: (t: string) => void;
}) {
  const [local, setLocal] = useState(value ?? tabs[0]);
  const active = value ?? local;

  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={t === active}
          onClick={() => {
            setLocal(t);
            onChange?.(t);
          }}
          className={`h-10 px-4 rounded-xl text-[14px] font-semibold transition-colors ${
            t === active
              ? "bg-brand-soft text-brand"
              : "text-ink-soft hover:bg-surface-2"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Select({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="h-10 px-3.5 inline-flex items-center gap-2 rounded-xl bg-surface border border-line text-[13.5px] font-medium text-ink-soft hover:border-line-strong transition-colors"
    >
      {label}
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "outline" | "ghost";
}) {
  const styles = {
    primary: "bg-brand text-white hover:opacity-90",
    soft: "bg-brand-soft text-brand hover:bg-brand-soft/70",
    outline: "border border-line bg-surface text-ink hover:bg-surface-2",
    ghost: "text-ink-soft hover:bg-surface-2",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-[14.5px] transition-colors disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * A ring chart for a small part-to-whole split. Segments are separated by a
 * surface-coloured gap rather than a stroke, so the ring reads as one object
 * with breaks in it instead of outlined slices.
 */
export function Donut({
  segments,
  centerValue,
  centerLabel,
  size = 148,
}: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  // Recharts draws the ring; the 2px surface-coloured gap between segments
  // (matching the spec's mark rules) comes from a stroke in the ground colour
  // rather than a manual arc-offset calculation.
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--color-surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {segments.map((s) => (
              <Cell key={s.label} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
        <div>
          <p className="text-[22px] font-extrabold tnum leading-none">{centerValue}</p>
          <p className="text-[11.5px] text-ink-soft mt-1">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
}


export function Legend({
  items,
}: {
  items: { label: string; value: number | string; color: string }[];
}) {
  return (
    <ul className="flex flex-col gap-2.5 min-w-0">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2.5 text-[13.5px]">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: i.color }}
            aria-hidden="true"
          />
          <span className="font-bold tnum">{i.value}</span>
          <span className="text-ink-soft truncate">{i.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-ink-faint">
      {children}
    </p>
  );
}

export function PageHead({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 text-[28px] sm:text-[32px] font-extrabold tracking-[-0.03em] leading-[1.1] text-balance">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
