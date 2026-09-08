"use client";

import { useState } from "react";
import { hm } from "@/lib/engine";

/**
 * Charts for the dashboard.
 *
 * One hue for magnitude, a recessive track for the reference value, hairline
 * solid grid, tabular figures. Everything takes its colour from the theme
 * tokens so both themes are drawn deliberately rather than flipped.
 */

export interface DayPoint {
  localDate: string;
  sealed: boolean;
  plannedMin: number;
  doneMin: number;
  readinessScore: number | null;
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function dayLabel(localDate: string): string {
  return DOW[new Date(`${localDate}T00:00:00Z`).getUTCDay()];
}

/**
 * Worked against planned, per day.
 *
 * Not two competing series: the plan is a reference track behind a single
 * measured bar, which is what the day actually was. A grouped pair would
 * imply the two are peers and double the marks for no added information.
 */
export function PlannedVsDone({ days }: { days: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const peak = Math.max(60, ...days.map((d) => Math.max(d.plannedMin, d.doneMin)));

  return (
    <figure className="m-0">
      <div className="flex items-baseline gap-4 mb-3">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft">
          <span className="w-2.5 h-2.5 rounded-[1px] bg-accent" aria-hidden="true" />
          Worked
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">
          <span className="w-2.5 h-2.5 rounded-[1px] bg-rule-strong" aria-hidden="true" />
          Planned
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 border-t border-rule" aria-hidden="true" />
        <div className="absolute inset-x-0 top-1/2 border-t border-rule" aria-hidden="true" />

        <div className="relative flex items-end gap-[3px] h-28">
          {days.map((d, i) => {
            const plannedPct = (d.plannedMin / peak) * 100;
            const donePct = (d.doneMin / peak) * 100;

            return (
              <button
                key={d.localDate}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="relative flex-1 h-full flex items-end group"
                aria-label={`${d.localDate}: ${hm(d.doneMin)} worked of ${hm(d.plannedMin)} planned`}
              >
                <span
                  className="absolute bottom-0 inset-x-0 bg-rule-strong/45 rounded-t-[4px]"
                  style={{ height: `${Math.max(plannedPct, d.sealed ? 2 : 0)}%` }}
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-0 inset-x-0 bg-accent rounded-t-[4px]"
                  style={{ height: `${donePct}%` }}
                  aria-hidden="true"
                />
                {!d.sealed && (
                  <span
                    className="absolute bottom-0 inset-x-0 h-px bg-rule-strong"
                    aria-hidden="true"
                  />
                )}

                {hover === i && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap bg-ink text-ground font-mono text-[10.5px] tnum px-2 py-1.5 rounded-[3px] pointer-events-none">
                    {d.sealed
                      ? `${hm(d.doneMin)} of ${hm(d.plannedMin)}`
                      : "no session"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-[3px] mt-2">
        {days.map((d) => (
          <span
            key={d.localDate}
            className="flex-1 text-center font-mono text-[9.5px] text-ink-faint"
          >
            {dayLabel(d.localDate)}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 font-mono text-[10.5px] tnum text-ink-faint">
        peak {hm(peak)} · last {days.length} days
      </figcaption>
    </figure>
  );
}

/** Readiness over time. One series, so the title names it and no legend is needed. */
export function ReadinessTrend({ days }: { days: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const points = days.filter((d) => d.readinessScore !== null);

  if (points.length < 2) {
    return (
      <p className="text-[13.5px] text-ink-soft">
        Two clock-ins and this starts showing how your readiness moves.
      </p>
    );
  }

  const w = 100;
  const h = 34;
  const coords = points.map((d, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - (d.readinessScore! / 100) * h,
    day: d,
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <figure className="m-0">
      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="w-full h-16 overflow-visible"
          role="img"
          aria-label={`Readiness across the last ${points.length} sessions, currently ${last.day.readinessScore} out of 100`}
        >
          {/* HIGH threshold at 75, the band boundary that changes the day's load */}
          <line
            x1="0"
            y1={h - 0.75 * h}
            x2={w}
            y2={h - 0.75 * h}
            stroke="var(--color-rule)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={last.x}
            cy={last.y}
            r="3"
            fill="var(--color-accent)"
            stroke="var(--color-surface)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute inset-0 flex">
          {coords.map((c, i) => (
            <button
              key={c.day.localDate}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="flex-1 h-full"
              aria-label={`${c.day.localDate}: readiness ${c.day.readinessScore}`}
            >
              {hover === i && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 whitespace-nowrap bg-ink text-ground font-mono text-[10.5px] tnum px-2 py-1.5 rounded-[3px] pointer-events-none">
                  {c.day.readinessScore}/100
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="mt-2 font-mono text-[10.5px] tnum text-ink-faint">
        now {last.day.readinessScore}/100 · line marks 75, where a full day begins
      </figcaption>
    </figure>
  );
}

/**
 * Why work did not finish. Nominal categories, so one hue for every bar -
 * darkening by size would burn the colour channel on the length already shown.
 */
export function ReasonBars({
  histogram,
  labelFor,
}: {
  histogram: Record<string, number>;
  labelFor: (key: string) => string;
}) {
  const rows = Object.entries(histogram).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) {
    return (
      <p className="text-[13.5px] text-ink-soft">
        Nothing unfinished yet, so there is nothing to explain.
      </p>
    );
  }

  const peak = Math.max(...rows.map(([, n]) => n));

  return (
    <div className="flex flex-col">
      {rows.map(([key, count]) => (
        <div
          key={key}
          className="grid grid-cols-[1fr_5.5rem_1.5rem] items-center gap-3 py-2 border-b border-rule last:border-b-0"
        >
          <span className="text-[14px] min-w-0 truncate">{labelFor(key)}</span>
          <span className="h-2 bg-surface-2 rounded-[2px] overflow-hidden">
            <span
              className="block h-full bg-accent rounded-[2px]"
              style={{ width: `${(count / peak) * 100}%` }}
              aria-hidden="true"
            />
          </span>
          <span className="font-mono text-[12px] tnum text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}
