import { hm } from "@/lib/engine";

/**
 * The capacity bar is the product's central claim, so it states the arithmetic
 * rather than just colouring a track. Overage is attributed to the plan - the
 * error is the plan, not the person.
 */
export function CapacityBar({
  availableMin,
  demandMin,
  compact = false,
}: {
  availableMin: number;
  demandMin: number;
  compact?: boolean;
}) {
  const over = demandMin > availableMin;
  const scale = Math.max(availableMin, demandMin, 1);
  const availablePct = (availableMin / scale) * 100;
  const demandPct = (demandMin / scale) * 100;

  return (
    <div>
      <div className="relative h-3 bg-surface-2 rounded-[2px] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-rule-strong/50"
          style={{ width: `${availablePct}%` }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-y-0 left-0 ${over ? "bg-over" : "bg-ok"}`}
          style={{ width: `${demandPct}%`, opacity: 0.85 }}
          aria-hidden="true"
        />
        {over && (
          <div
            className="absolute inset-y-0 w-px bg-ink"
            style={{ left: `${availablePct}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <p className="mt-2 font-mono text-[11.5px] tnum text-ink-soft">
        <span className={over ? "text-over font-700" : "text-ok font-700"}>
          {hm(demandMin)}
        </span>{" "}
        planned into <span className="text-ink">{hm(availableMin)}</span> available
        {over && (
          <span className="text-over"> — over by {hm(demandMin - availableMin)}</span>
        )}
      </p>

      {!compact && over && (
        <p className="mt-1 text-[13.5px] text-ink-soft">
          The plan is too big for the day, not the other way round. Cut something.
        </p>
      )}
    </div>
  );
}
