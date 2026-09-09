const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Habits down, days across. Presence is carried by fill strength rather than
 * two different hues, so a missed day reads as absence rather than as an error.
 */
export function WeekGrid({ rows }: { rows: { name: string; days: boolean[] }[] }) {
  const total = rows.reduce((n, r) => n + r.days.filter(Boolean).length, 0);
  const possible = rows.length * 7;
  const pct = Math.round((total / possible) * 100);

  return (
    <div>
      <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))] gap-y-1 items-center">
        <span />
        {DOW.map((d) => (
          <span key={d} className="text-center text-[11.5px] font-semibold text-ink-soft">
            {d}
          </span>
        ))}

        {rows.map((r) => (
          <div key={r.name} className="contents">
            <span className="text-[13px] text-ink-soft truncate pr-2">{r.name}</span>
            {r.days.map((on, i) => (
              <span key={i} className="grid place-items-center py-1">
                <span
                  className={`w-[13px] h-[13px] rounded-full ${on ? "bg-mint" : "bg-surface-2"}`}
                  title={`${r.name}, ${DOW[i]}: ${on ? "done" : "missed"}`}
                />
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[12px] text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-mint" aria-hidden="true" />
            Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-2" aria-hidden="true" />
            Missed
          </span>
        </div>
        <span className="text-[12.5px] font-semibold tnum text-ink-soft">
          {pct}% overall this week
        </span>
      </div>
    </div>
  );
}
