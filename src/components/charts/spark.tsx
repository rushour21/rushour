/** A small bar sparkline for a stat card's own week. */
export function Spark({
  values,
  tone,
  labels = ["M", "T", "W", "T", "F", "S", "S"],
}: {
  values: number[];
  tone: "sky" | "mint" | "rose" | "amber" | "violet";
  labels?: string[];
}) {
  const peak = Math.max(...values, 1);
  const fill = {
    sky: "bg-sky/70",
    mint: "bg-mint/70",
    rose: "bg-rose/60",
    amber: "bg-amber/70",
    violet: "bg-violet/70",
  }[tone];

  return (
    <div>
      <div className="flex items-end gap-1 h-[46px]">
        {values.map((v, i) => (
          <span key={i} className={`flex-1 rounded-t-[3px] ${fill}`} style={{ height: `${(v / peak) * 100}%` }} />
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center text-[9.5px] text-ink-faint">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A single-series line with a filled area and an emphasised endpoint. */
export function LineChart({
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
  const peak = Math.max(...values) * 1.15;
  const low = Math.min(...values) * 0.85;
  const span = peak - low || 1;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 100,
    y: 100 - ((v - low) / span) * 100,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const area = `${line} L100 100 L0 100 Z`;
  const last = pts[pts.length - 1];

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
        <div className="flex-1 min-w-0 relative" style={{ height }}>
          <span className="absolute inset-x-0 top-0 border-t border-line" aria-hidden="true" />
          <span className="absolute inset-x-0 top-1/2 border-t border-line" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 border-t border-line" aria-hidden="true" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <path d={area} fill="var(--color-brand)" opacity="0.1" />
            <path
              d={line}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={last.x}
              cy={last.y}
              r="3"
              fill="var(--color-brand)"
              stroke="var(--color-surface)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
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

/** A labelled horizontal bar, for category and skill breakdowns. */
export function BarRow({
  label,
  pct,
  tone = "sky",
}: {
  label: string;
  pct: number;
  tone?: "sky" | "mint" | "amber" | "violet" | "rose" | "brand";
}) {
  const fill = {
    sky: "bg-sky",
    mint: "bg-mint",
    amber: "bg-amber",
    violet: "bg-violet",
    rose: "bg-rose",
    brand: "bg-brand",
  }[tone];

  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)_38px] items-center gap-3">
      <span className="text-[13px] text-ink-soft truncate">{label}</span>
      <span className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <span className={`block h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-[12px] font-semibold tnum text-ink-soft text-right">{pct}%</span>
    </div>
  );
}

/** A stat card with a delta against the previous period. */
export function DeltaStat({
  label,
  value,
  delta,
  note = "vs last month",
}: {
  label: string;
  value: string;
  delta: number;
  note?: string;
}) {
  const up = delta >= 0;
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <p className="text-[12.5px] text-ink-soft">{label}</p>
      <p className="mt-1.5 text-[24px] font-extrabold tnum tracking-[-0.02em] leading-none">
        {value}
      </p>
      <p className={`mt-2 text-[12px] font-semibold tnum ${up ? "text-mint" : "text-rose"}`}>
        {up ? "↑" : "↓"} {Math.abs(delta)}%{" "}
        <span className="text-ink-faint font-medium">{note}</span>
      </p>
    </div>
  );
}
