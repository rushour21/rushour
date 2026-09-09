import type { ReactNode } from "react";

export type Tone = "mint" | "violet" | "amber" | "sky";

const TONES: Record<Tone, { chip: string; bar: string }> = {
  mint: { chip: "bg-mint-soft text-mint", bar: "bg-mint" },
  violet: { chip: "bg-violet-soft text-violet", bar: "bg-violet" },
  amber: { chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  sky: { chip: "bg-sky-soft text-sky", bar: "bg-sky" },
};

/**
 * A headline figure with the share it represents. `pct` is null when the value
 * has no denominator to speak of - the bar is then omitted rather than drawn
 * empty, which would read as zero progress instead of "not applicable".
 */
export function StatCard({
  icon,
  value,
  label,
  pct,
  tone,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  pct: number | null;
  tone: Tone;
}) {
  const t = TONES[tone];

  return (
    <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3.5">
        <span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${t.chip}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[19px] font-extrabold tracking-[-0.02em] tnum leading-tight">
            {value}
          </p>
          <p className="text-[13px] text-ink-soft truncate">{label}</p>
        </div>
      </div>

      {pct !== null && (
        <div className="mt-4 flex items-center gap-3">
          <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <span
              className={`block h-full rounded-full ${t.bar}`}
              style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
            />
          </span>
          <span className="text-[12px] font-semibold text-ink-soft tnum">{pct}%</span>
        </div>
      )}
    </div>
  );
}
