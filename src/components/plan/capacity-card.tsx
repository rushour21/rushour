"use client";

import { IconBolt, IconInfo } from "@/components/app/icons";
import { hm } from "@/lib/sample/data";
import { taskStore } from "@/lib/store/entities";

/** A default workday length, since there's no per-user setting for it yet -
 *  an honest, stated assumption rather than data pretending to be personal. */
const ASSUMED_AVAILABLE_MIN = 8 * 60;

/**
 * Planned is real: the total minutes of everything not yet done. Available
 * is a stated 8h assumption, not a fabricated personal stat - there's no
 * real per-user workday-length setting yet, so this says so rather than
 * inventing a precise-looking number.
 */
export function CapacityCard() {
  const tasks = taskStore.useItems();
  const plannedMin = tasks.filter((t) => !t.done).reduce((sum, t) => sum + t.minutes, 0);
  const pct = Math.round((plannedMin / ASSUMED_AVAILABLE_MIN) * 100);
  const over = plannedMin > ASSUMED_AVAILABLE_MIN;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="flex items-center gap-2 text-[14px] font-bold">
          <span className="text-amber">
            <IconBolt />
          </span>
          Your capacity
          <span className="text-ink-faint" title="Available assumes an 8-hour workday - there's no per-user setting for this yet.">
            <IconInfo className="w-4 h-4" />
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[12.5px] text-ink-soft mb-0.5">Available (assumed)</p>
          <p className="text-[22px] font-extrabold tnum tracking-[-0.02em]">{hm(ASSUMED_AVAILABLE_MIN)}</p>
        </div>
        <div>
          <p className="text-[12.5px] text-ink-soft mb-0.5">Planned</p>
          <p className="text-[22px] font-extrabold tnum tracking-[-0.02em]">{hm(plannedMin)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
          <span
            className={`block h-full rounded-full ${over ? "bg-rose" : "bg-mint"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </span>
        <span className="text-[13px] font-bold tnum text-ink-soft">{pct}%</span>
      </div>

      {over && (
        <p className="mt-3 text-[12.5px] text-rose">
          {hm(plannedMin - ASSUMED_AVAILABLE_MIN)} over the assumed workday.
        </p>
      )}
    </section>
  );
}
