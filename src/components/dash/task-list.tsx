"use client";

import { useState } from "react";
import { CategoryChip } from "./panel";
import { IconDots } from "@/components/app/icons";

export interface TaskRow {
  id: string;
  title: string;
  time: string;
  category: string;
  done: boolean;
}

/**
 * Today's list. Ticking is optimistic and local for now - the flow is what is
 * being designed here, and a checkbox that waits on a round trip reads as
 * broken even when it is working.
 */
export function TaskList({ tasks }: { tasks: TaskRow[] }) {
  const [rows, setRows] = useState(tasks);

  if (rows.length === 0) {
    return (
      <p className="text-[14px] text-ink-soft py-6 text-center">
        Nothing planned yet. Plan your day to fill this in.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {rows.map((t) => (
        <li
          key={t.id}
          className="flex items-center gap-3 py-2.5 border-b border-line last:border-b-0"
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={t.done}
            aria-label={t.done ? `Mark ${t.title} not done` : `Mark ${t.title} done`}
            onClick={() =>
              setRows((p) => p.map((r) => (r.id === t.id ? { ...r, done: !r.done } : r)))
            }
            className={`w-5 h-5 rounded-full grid place-items-center shrink-0 border-2 transition-colors ${
              t.done ? "bg-mint border-mint" : "border-line-strong hover:border-brand"
            }`}
          >
            {t.done && (
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
            {t.time}
          </span>
          <CategoryChip name={t.category} />

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
  );
}
