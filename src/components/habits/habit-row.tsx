"use client";

import { useState } from "react";
import {
  IconBook,
  IconDots,
  IconDrop,
  IconDumbbell,
  IconLaptop,
  IconMoon,
  IconSun,
} from "@/components/app/icons";
import type { Habit } from "@/lib/sample/habits";

const ICON: Record<string, React.ReactNode> = {
  sun: <IconSun />,
  dumbbell: <IconDumbbell />,
  laptop: <IconLaptop />,
  book: <IconBook />,
  drop: <IconDrop />,
  moon: <IconMoon />,
};

const TONE = {
  amber: "bg-amber-soft text-amber",
  mint: "bg-mint-soft text-mint",
  sky: "bg-sky-soft text-sky",
  violet: "bg-violet-soft text-violet",
  rose: "bg-rose-soft text-rose",
};

/**
 * A habit for today. The right-hand control is the state: a value plus a Done
 * chip once logged, a button before that - so the row reads as complete or not
 * without needing the checkbox to be parsed.
 */
export function HabitRow({ habit }: { habit: Habit }) {
  const [done, setDone] = useState(habit.done);

  return (
    <li className="flex items-center gap-3 py-3 border-b border-line last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
        onClick={() => setDone((d) => !d)}
        className={`w-[22px] h-[22px] rounded-full grid place-items-center shrink-0 border-2 transition-colors ${
          done ? "bg-mint border-mint" : "border-line-strong hover:border-brand"
        }`}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7" />
          </svg>
        )}
      </button>

      <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${TONE[habit.tone]}`}>
        <span className="scale-[0.85]">{ICON[habit.icon]}</span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold truncate">{habit.name}</p>
        <p className="text-[12.5px] text-ink-soft truncate">{habit.target}</p>
      </div>

      {done ? (
        <div className="flex items-center gap-2.5 shrink-0">
          {habit.value && (
            <span className="text-[13px] font-semibold tnum text-ink-soft">{habit.value}</span>
          )}
          <span className="text-[12px] font-semibold px-2.5 py-1.5 rounded-lg bg-mint-soft text-mint">
            Done
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDone(true)}
          className="shrink-0 h-9 px-3.5 rounded-lg border border-line text-[12.5px] font-semibold text-ink-soft hover:border-brand hover:text-brand transition-colors"
        >
          Mark Done
        </button>
      )}

      <button aria-label={`Actions for ${habit.name}`} className="text-ink-faint hover:text-ink shrink-0">
        <IconDots className="w-4 h-4" />
      </button>
    </li>
  );
}
