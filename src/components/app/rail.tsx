"use client";

import { useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, addWeeks, format, isSameDay, isToday as isTodayFns, startOfWeek } from "date-fns";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "./icons";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The date header and week strip that opens the right rail on every screen.
 * Selecting a day is local state for now - the flow is what is being designed,
 * and the surrounding panels take their dates as props.
 *
 * Date math is date-fns throughout (no hand-rolled startOfWeek/addDays), and
 * "jump to date" is a real react-day-picker month calendar in a popover -
 * the week strip stays for fast prev/next-week browsing, since that's a
 * different interaction than a calendar library models, but picking an
 * arbitrary date goes through the accessible, keyboard-navigable library
 * component rather than a hand-built grid.
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const monday = startOfWeek(selected, { weekStartsOn: 1 });
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const isToday = isTodayFns(selected);

  function pick(d: Date) {
    setSelected(d);
    onChange?.(d);
  }

  return (
    <div
      ref={anchorRef}
      className={`relative ${compact ? "" : "bg-surface border border-line rounded-2xl p-4 shadow-[var(--shadow-card)]"}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          aria-expanded={pickerOpen}
          aria-haspopup="dialog"
          className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] hover:text-brand transition-colors"
        >
          <IconCalendar className="w-4 h-4 text-ink-faint" />
          {/* The server formats in its own locale and timezone, the browser in
              the visitor's, so this text legitimately differs between renders. */}
          <span suppressHydrationWarning>{format(selected, "EEE, d MMM yyyy")}</span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <RailButton label="Previous week" onClick={() => pick(addWeeks(selected, -1))}>
            <IconChevronLeft className="w-4 h-4" />
          </RailButton>
          <RailButton label="Next week" onClick={() => pick(addWeeks(selected, 1))}>
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
          const active = isSameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => pick(d)}
              aria-current={active ? "date" : undefined}
              className={`h-10 rounded-xl text-[14px] font-semibold tnum transition-colors ${
                active
                  ? "bg-brand text-white"
                  : isTodayFns(d)
                    ? "text-brand hover:bg-surface-2"
                    : "text-ink hover:bg-surface-2"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {pickerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPickerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Jump to date"
            className="absolute z-50 top-full left-0 mt-2 bg-surface border border-line rounded-2xl shadow-[var(--shadow-lift)] p-3"
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (!d) return;
                pick(d);
                setPickerOpen(false);
              }}
              weekStartsOn={1}
              showOutsideDays
              className="rdp-rushour"
            />
          </div>
        </>
      )}
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#6d8bff] p-5 min-h-[128px]">
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
