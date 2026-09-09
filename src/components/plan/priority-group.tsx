"use client";

import { useState } from "react";
import { IconDots, IconPlus } from "@/components/app/icons";
import { CATEGORY_CHIP, hmLong, PRIORITY_META, type Priority, type Task } from "@/lib/sample/data";

/**
 * One priority bucket. The ring on the heading is the only place the bucket's
 * colour appears at full strength - the rows below stay neutral so the eye
 * lands on task titles rather than on three competing colour fields.
 */
export function PriorityGroup({
  priority,
  tasks,
  showBlurb = false,
}: {
  priority: Priority;
  tasks: Task[];
  showBlurb?: boolean;
}) {
  const meta = PRIORITY_META[priority];
  const [rows, setRows] = useState(tasks);
  const [open, setOpen] = useState(true);

  const total = rows.filter((t) => !t.done).reduce((n, t) => n + t.minutes, 0);

  return (
    <section className="rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <span className={`w-5 h-5 rounded-full border-[2.5px] shrink-0 ${meta.ring}`} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[15.5px] font-bold">
            {meta.group}
            <span className="text-[12px] font-bold text-ink-soft bg-surface-2 rounded-md px-2 py-0.5 tnum">
              {rows.length}
            </span>
          </p>
          {showBlurb && <p className="text-[12.5px] text-ink-soft mt-0.5">{meta.blurb}</p>}
        </div>

        <div className="flex-1" />

        {showBlurb ? (
          <span className="text-[14px] font-bold tnum text-ink-soft">{hmLong(total)}</span>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80"
          >
            <IconPlus className="w-4 h-4" />
            Add task
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? `Collapse ${meta.group}` : `Expand ${meta.group}`}
          className="text-ink-faint hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-transform ${open ? "" : "-rotate-90"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
      </div>

      {open && (
        <ul className="border-t border-line">
          {rows.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-b-0"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={t.done}
                aria-label={t.done ? `Mark ${t.title} not done` : `Mark ${t.title} done`}
                onClick={() =>
                  setRows((p) => p.map((r) => (r.id === t.id ? { ...r, done: !r.done } : r)))
                }
                className={`w-[22px] h-[22px] rounded-lg grid place-items-center shrink-0 border-2 transition-colors ${
                  t.done ? "bg-mint border-mint" : "border-line-strong hover:border-brand"
                }`}
              >
                {t.done && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 min-w-0 truncate text-[14.5px] font-medium ${
                  t.done ? "text-ink-faint line-through" : ""
                }`}
              >
                {t.title}
              </span>

              <span className="text-[12.5px] text-ink-soft tnum shrink-0 hidden sm:block">
                {hmLong(t.minutes)}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-md shrink-0 ${CATEGORY_CHIP[t.category]}`}
              >
                {t.category}
              </span>

              <button
                type="button"
                aria-label={`More actions for ${t.title}`}
                className="text-ink-faint hover:text-ink shrink-0"
              >
                <IconDots className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
