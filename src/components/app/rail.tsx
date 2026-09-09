"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "./icons";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The date header and week strip that opens the right rail on every screen.
 * Selecting a day is local state for now - the flow is what is being designed,
 * and the surrounding panels take their dates as props.
 */
export function DateNav({
  date,
  onChange,
  compact = false,
}: {
  date: Date;
  onChange?: (d: Date) => void;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState(date);

  const monday = startOfWeek(selected);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const isToday = sameDay(selected, new Date());

  function pick(d: Date) {
    setSelected(d);
    onChange?.(d);
  }

  return (
    <div className={compact ? "" : "bg-surface border border-line rounded-2xl p-4 shadow-[var(--shadow-card)]"}>
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* The server formats in its own locale and timezone, the browser in the
            visitor's, so this text legitimately differs between the two renders. */}
        <p className="text-[15px] font-bold tracking-[-0.01em]" suppressHydrationWarning>
          {selected.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <RailButton label="Previous week" onClick={() => pick(addDays(selected, -7))}>
            <IconChevronLeft className="w-4 h-4" />
          </RailButton>
          <RailButton label="Next week" onClick={() => pick(addDays(selected, 7))}>
            <IconChevronRight className="w-4 h-4" />
          </RailButton>
          {!isToday && (
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="ml-1 h-8 px-3 rounded-lg bg-surface-2 text-[12.5px] font-semibold hover:bg-surface-3 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <span key={d} className="text-center text-[11px] font-semibold text-ink-faint py-1">
            {d}
          </span>
        ))}
        {week.map((d) => {
          const active = sameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => pick(d)}
              aria-current={active ? "date" : undefined}
              className={`h-10 rounded-xl text-[14px] font-semibold tnum transition-colors ${
                active
                  ? "bg-brand text-white"
                  : sameDay(d, new Date())
                    ? "text-brand hover:bg-surface-2"
                    : "text-ink hover:bg-surface-2"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 grid place-items-center rounded-lg border border-line text-ink-soft hover:bg-surface-2 transition-colors"
    >
      {children}
    </button>
  );
}

/** The line at the foot of the rail. Decorative, and the one place copy is warm. */
export function QuoteCard({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#6d8bff] dark:from-[#2a3a72] dark:to-[#38487f] p-5 min-h-[128px]">
      <p className="relative z-10 text-white font-bold text-[15px] leading-snug max-w-[80%]">
        {text}
      </p>
      <svg viewBox="0 0 260 90" className="absolute bottom-0 left-0 w-full" aria-hidden="true">
        <circle cx="205" cy="34" r="17" fill="#ffd479" opacity="0.9" />
        <path d="M0 66 55 44 110 62 165 40 215 58 260 44V90H0z" fill="#ffffff" opacity="0.18" />
        <path d="M0 78 60 62 120 76 185 58 260 72V90H0z" fill="#ffffff" opacity="0.22" />
      </svg>
    </div>
  );
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // Monday-first
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
