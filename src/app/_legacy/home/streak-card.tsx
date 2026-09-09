import { Card, Pill } from "@/components/ui";
import { DAYS_PER_REST, type Level, type Streak } from "@/lib/engine";

/**
 * The streak, built to survive a missed day.
 *
 * It counts closing the loop, not finishing the plan, and rest days absorb a
 * gap. The objection to streaks is that breaking one becomes a reason to quit;
 * a streak that cannot be broken by a single bad day does not carry that.
 */
export function StreakCard({ streak, level }: { streak: Streak; level: Level }) {
  const pct = Math.round((level.intoLevel / level.levelSpan) * 100);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
        <div>
          <p className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-faint mb-1">
            Streak
          </p>
          <p className="font-display font-700 text-[2.6rem] leading-none tnum">
            {streak.current}
          </p>
          <p className="font-mono text-[10px] text-ink-faint mt-1 tnum">
            {streak.current === 0
              ? "days"
              : streak.best > streak.current
                ? `days · best ${streak.best}`
                : "days · your best"}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <p className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-faint">
              Level {level.level}
            </p>
            <p className="font-mono text-[10px] tnum text-ink-faint">
              {level.toNext} to go
            </p>
          </div>
          <div
            className="h-2 bg-surface-2 rounded-[2px] overflow-hidden"
            role="img"
            aria-label={`Level ${level.level}, ${pct}% of the way to level ${level.level + 1}`}
          >
            <div
              className="h-full bg-accent rounded-[2px]"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: 2 }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`w-6 h-2 rounded-[2px] ${
                  i < streak.restBanked ? "bg-ok" : "bg-surface-2 border border-rule"
                }`}
              />
            ))}
            <span className="font-mono text-[10px] text-ink-faint ml-1">
              {streak.restBanked === 0
                ? `rest days — earn one every ${DAYS_PER_REST} days`
                : `${streak.restBanked} rest ${streak.restBanked === 1 ? "day" : "days"} banked`}
            </span>
          </div>

          {streak.protectedByRest && (
            <div className="mt-2.5">
              <Pill tone="ok">A rest day covered a gap</Pill>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 pt-3 border-t border-rule text-[13px] text-ink-soft">
        The streak counts days you clocked in <em>and</em> out — not days you
        finished everything. A rest day absorbs one miss, so a single bad day
        cannot undo a month.
      </p>
    </Card>
  );
}
