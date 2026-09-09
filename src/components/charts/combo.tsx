/**
 * Bars for count, a line for duration.
 *
 * Both series are normalised to one axis rather than given a second y-scale:
 * a dual axis lets the two curves be aligned arbitrarily, which invents a
 * correlation that is not in the data. The legend and tooltips carry the real
 * values.
 */
export function ComboChart({
  data,
  labels,
  height = 150,
}: {
  data: { tasks: number; focus: number }[];
  labels: string[];
  height?: number;
}) {
  const taskPeak = Math.max(...data.map((d) => d.tasks), 1);
  const focusPeak = Math.max(...data.map((d) => d.focus), 1);

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.focus / focusPeak) * 92,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

  return (
    <figure className="m-0">
      <div className="relative" style={{ height }}>
        <span className="absolute inset-x-0 top-0 border-t border-line" aria-hidden="true" />
        <span className="absolute inset-x-0 top-1/3 border-t border-line" aria-hidden="true" />
        <span className="absolute inset-x-0 top-2/3 border-t border-line" aria-hidden="true" />
        <span className="absolute inset-x-0 bottom-0 border-t border-line" aria-hidden="true" />

        <div className="absolute inset-0 flex items-end gap-[3px]">
          {data.map((d, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-[3px] bg-brand/30 hover:bg-brand/50 transition-colors"
              style={{ height: `${(d.tasks / taskPeak) * 92}%` }}
              title={`${d.tasks} tasks · ${d.focus.toFixed(1)}h focus`}
            />
          ))}
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          aria-hidden="true"
        >
          <path
            d={line}
            fill="none"
            stroke="var(--color-sky)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-[10.5px] text-ink-faint">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </figure>
  );
}
