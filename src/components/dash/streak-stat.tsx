"use client";

import { StatCard } from "./stat-cards";
import { IconFlame } from "@/components/app/icons";
import { useClockHistory } from "@/lib/store/clock";
import { currentStreak } from "@/lib/stats/streak";

/** Consecutive days with a real closed clock session - not a hardcoded "6 days". */
export function StreakStat() {
  const history = useClockHistory();
  const streak = currentStreak(history);

  return (
    <StatCard
      icon={<IconFlame />}
      value={streak === 0 ? "No streak yet" : `${streak} ${streak === 1 ? "day" : "days"}`}
      label="Current streak"
      pct={Math.min(100, Math.round((streak / 7) * 100))}
      tone="amber"
    />
  );
}
