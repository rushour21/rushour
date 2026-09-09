"use client";

import { useState } from "react";
import { IconDots, IconPlus } from "@/components/app/icons";
import { CATEGORY_CHIP, hmLong, PRIORITY_META, type Priority } from "@/lib/sample/data";
import type { TaskRecord } from "@/lib/store/entities";

/**
 * One priority bucket. The ring on the heading is the only place the bucket's
 * colour appears at full strength - the rows below stay neutral so the eye
 * lands on task titles rather than on three competing colour fields.
 */
export function PriorityGroup({
  priority,
  tasks,
  showBlurb = false,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: {
  priority: Priority;
  tasks: TaskRecord[];
  showBlurb?: boolean;
  onAdd?: () => void;
  onToggle?: (id: string) => void;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
}) {
  const meta = PRIORITY_META[priority];
  const [open, setOpen] = useState(true);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const total = tasks.filter((t) => !t.done).reduce((n, t) => n + t.minutes, 0);

  return (
    <section className="rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <span className={`w-5 h-5 rounded-full border-[2.5px] shrink-0 ${meta.ring}`} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[15.5px] font-bold">
            {meta.group}
            <span className="text-[12px] font-bold text-ink-soft bg-surface-2 rounded-md px-2 py-0.5 tnum">
              {tasks.length}
            </span>
          </p>
          {showBlurb && <p className="text-[12.5px] text-ink-soft mt-0.5">{meta.blurb}</p>}
        </div>

        <div className="flex-1" />

        {showBlurb && (
          <span className="text-[14px] font-bold tnum text-ink-soft">{hmLong(total)}</span>
        )}

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
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
          {tasks.length === 0 && (
            <li className="px-5 py-6 text-center text-[13.5px] text-ink-soft">
              Nothing here yet.
            </li>
          )}
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-b-0"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={t.done}
                aria-label={t.done ? `Mark ${t.title} not done` : `Mark ${t.title} done`}
                onClick={() => onToggle?.(t.id)}
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

              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label={`More actions for ${t.title}`}
                  aria-expanded={menuFor === t.id}
                  onClick={() => setMenuFor((m) => (m === t.id ? null : t.id))}
                  className="text-ink-faint hover:text-ink"
                >
                  <IconDots className="w-4 h-4" />
                </button>

                {menuFor === t.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuFor(null)}
                      aria-hidden="true"
                    />
                    <div className="absolute z-50 right-0 top-full mt-1 w-36 bg-surface border border-line rounded-xl shadow-[var(--shadow-lift)] p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuFor(null);
                          onEdit?.(t);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium hover:bg-surface-2 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuFor(null);
                          onDelete?.(t);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium text-rose hover:bg-rose-soft transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
