import { Card } from "@/components/ui";
import type { Achievement } from "@/lib/engine";

/**
 * Each badge marks a behaviour the product exists to cause, never mere usage.
 * Unearned ones stay visible with their real progress, so they read as a map
 * rather than as a scold.
 */
export function Achievements({ items }: { items: Achievement[] }) {
  const earned = items.filter((a) => a.earned).length;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint">
          Milestones
        </p>
        <p className="font-mono text-[10.5px] tnum text-ink-faint">
          {earned} of {items.length}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((a) => (
          <Card key={a.id} tone={a.earned ? "ok" : "plain"} className="p-3.5">
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 ${
                  a.earned ? "bg-ok border-ok" : "border-rule-strong"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`font-display font-600 text-[14.5px] leading-snug ${
                    a.earned ? "" : "text-ink-soft"
                  }`}
                >
                  {a.name}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft leading-snug">{a.detail}</p>

                {!a.earned && a.progress && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex-1 h-1.5 bg-surface-2 rounded-[2px] overflow-hidden">
                      <span
                        className="block h-full bg-rule-strong rounded-[2px]"
                        style={{ width: `${(a.progress.have / a.progress.need) * 100}%` }}
                      />
                    </span>
                    <span className="font-mono text-[10px] tnum text-ink-faint">
                      {a.progress.have}/{a.progress.need}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
