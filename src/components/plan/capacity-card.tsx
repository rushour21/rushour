"use client";

import { IconBolt, IconInfo } from "@/components/app/icons";
import { hm } from "@/lib/sample/data";
import { taskStore } from "@/lib/store/entities";
import { profileStore } from "@/lib/store/profile";

/** A default workday length, used only until the user has set their real
 *  daily commitments (onboarding, or later in Settings) - an honest, stated
 *  assumption rather than data pretending to be personal. */
const ASSUMED_AVAILABLE_MIN = 8 * 60;

/**
 * Planned is always real: the total minutes of everything not yet done.
 * Available is the user's real committed hours (sleep/work/commute/meals/
 * everything else, from onboarding) once they've set them; until then it
 * falls back to a stated 8h assumption rather than inventing a precise
 * personal-looking number.
 */
export function CapacityCard() {
  const tasks = taskStore.useItems();
  const profile = profileStore.useProfile();

  const hasConstraints = profile.workH !== null;
  const committedH = hasConstraints
    ? (profile.sleepTargetH ?? 0) + (profile.workH ?? 0) + (profile.commuteH ?? 0) + (profile.mealsH ?? 0) + (profile.lifeH ?? 0)
    : null;
  const availableMin = committedH !== null ? Math.max(0, Math.round((24 - committedH) * 60)) : ASSUMED_AVAILABLE_MIN;

  const plannedMin = tasks.filter((t) => !t.done).reduce((sum, t) => sum + t.minutes, 0);
  const pct = availableMin === 0 ? 100 : Math.round((plannedMin / availableMin) * 100);
  const over = plannedMin > availableMin;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="flex items-center gap-2 text-[14px] font-bold">
          <span className="text-amber">
            <IconBolt />
          </span>
          Your capacity
          <span
            className="text-ink-faint"
            title={
              hasConstraints
                ? "Available is 24h minus your sleep, work, commute, meals and other daily commitments from onboarding."
                : "Available assumes an 8-hour workday - set your real daily commitments in onboarding or Settings."
            }
          >
            <IconInfo className="w-4 h-4" />
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[12.5px] text-ink-soft mb-0.5">
            Available{hasConstraints ? "" : " (assumed)"}
          </p>
          <p className="text-[22px] font-extrabold tnum tracking-[-0.02em]">{hm(availableMin)}</p>
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
          {hm(plannedMin - availableMin)} over {hasConstraints ? "your available time" : "the assumed workday"}.
        </p>
      )}
    </section>
  );
}
