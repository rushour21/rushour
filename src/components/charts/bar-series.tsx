/**
 * A dense bar series over a date range. One hue: the bars encode magnitude,
 * and colouring them by height would spend the colour channel on information
 * the height already carries.
 */
export function BarSeries({
  values,
  labels,
  yTicks,
  height = 120,
}: {
  values: number[];
  labels: string[];
  yTicks?: string[];
  height?: number;
}) {
  const peak = Math.max(...values, 1);

  return (
    <figure className="m-0">
      <div className="flex gap-3">
        {yTicks && (
          <div
            className="flex flex-col justify-between text-[10.5px] text-ink-faint tnum shrink-0 text-right"
            style={{ height }}
          >
            {yTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <div className="flex-1 min-w-0 relative">
          <span className="absolute inset-x-0 top-0 border-t border-line" aria-hidden="true" />
          <span className="absolute inset-x-0 top-1/2 border-t border-line" aria-hidden="true" />
          <div className="flex items-end gap-[2px]" style={{ height }}>
            {values.map((v, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-[3px] bg-brand/70 hover:bg-brand transition-colors"
                style={{ height: `${(v / peak) * 100}%` }}
                title={`${v}%`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-2 pl-[38px] text-[10.5px] text-ink-faint">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </figure>
  );
}
