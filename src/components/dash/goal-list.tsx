import type { ReactNode } from "react";

export interface GoalRow {
  id: string;
  title: string;
  subtitle: string;
  pct: number;
  tone: "amber" | "rose" | "violet" | "sky" | "mint";
  icon: ReactNode;
}

const TONES = {
  amber: { chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  rose: { chip: "bg-rose-soft text-rose", bar: "bg-rose" },
  violet: { chip: "bg-violet-soft text-violet", bar: "bg-violet" },
  sky: { chip: "bg-sky-soft text-sky", bar: "bg-sky" },
  mint: { chip: "bg-mint-soft text-mint", bar: "bg-mint" },
};

export function GoalList({ goals }: { goals: GoalRow[] }) {
  if (goals.length === 0) {
    return (
      <p className="text-[14px] text-ink-soft py-6 text-center">
        No active goals. Two at a time is the limit — pick the ones that matter now.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {goals.map((g) => {
        const t = TONES[g.tone];
        return (
          <li key={g.id} className="flex gap-3.5">
            <span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${t.chip}`}>
              {g.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold truncate">{g.title}</p>
              <p className="text-[12.5px] text-ink-soft truncate">{g.subtitle}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${t.bar}`}
                    style={{ width: `${Math.min(100, Math.max(2, g.pct))}%` }}
                  />
                </span>
                <span className="text-[12px] font-semibold text-ink-soft tnum">{g.pct}%</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
