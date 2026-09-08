import { hm } from "@/lib/engine";

/**
 * Planned against actual, after the fact.
 *
 * Deliberately not the capacity bar. Capacity is a decision about the future
 * and overage there is a warning; this is a record of the past, where going
 * long on an estimate is evidence rather than a failure. Nothing here is red,
 * per REQ-022 - the calibration figure is what does the work, not a colour.
 */
export function OutcomeBar({
  plannedMin,
  actualMin,
  label = "planned",
}: {
  plannedMin: number;
  actualMin: number;
  label?: string;
}) {
  const scale = Math.max(plannedMin, actualMin, 1);
  const plannedPct = (plannedMin / scale) * 100;
  const actualPct = (actualMin / scale) * 100;
  const ran = actualMin > plannedMin;

  return (
    <div>
      <div className="relative h-3 bg-surface-2 rounded-[2px] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-rule-strong/45"
          style={{ width: `${plannedPct}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 left-0 bg-accent/80"
          style={{ width: `${actualPct}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 w-px bg-ink/50"
          style={{ left: `${plannedPct}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 font-mono text-[11.5px] tnum text-ink-soft">
        <span className="text-ink font-700">{hm(actualMin)}</span> against{" "}
        {hm(plannedMin)} {label}
        {ran && plannedMin > 0 && (
          <span>
            {" "}
            · ran {Math.round((actualMin / plannedMin - 1) * 100)}% long
          </span>
        )}
      </p>
    </div>
  );
}
