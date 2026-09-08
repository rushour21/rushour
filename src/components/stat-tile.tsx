import type { ReactNode } from "react";

/**
 * A single number is a stat tile, never a one-bar chart.
 *
 * `value` is null when there is not enough evidence to state a figure. Showing
 * "0%" on day one would be a lie about a number we do not have, and the empty
 * state reads as a sentence rather than a zero.
 */
export function StatTile({
  label,
  value,
  unit,
  note,
  empty,
  tone = "plain",
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  note?: ReactNode;
  empty: string;
  tone?: "plain" | "good" | "watch";
}) {
  const has = value !== null && value !== undefined;
  const accent = {
    plain: "text-ink",
    good: "text-ok",
    watch: "text-hold",
  }[tone];

  return (
    <div className="bg-surface border border-rule rounded-[4px] p-3.5 flex flex-col gap-1">
      <p className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-faint">
        {label}
      </p>
      {has ? (
        <p className={`font-display font-700 text-[1.55rem] leading-none tnum ${accent}`}>
          {value}
          {unit && (
            <span className="font-mono font-500 text-[0.8rem] text-ink-faint ml-0.5">
              {unit}
            </span>
          )}
        </p>
      ) : (
        <p className="text-[13px] text-ink-soft leading-snug">{empty}</p>
      )}
      {has && note && (
        <p className="font-mono text-[10px] tnum text-ink-faint leading-snug">{note}</p>
      )}
    </div>
  );
}
