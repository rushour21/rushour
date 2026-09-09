"use client";

import { StatCard } from "./stat-cards";
import { IconClock } from "@/components/app/icons";
import { REQUIRED_MS, formatElapsed, useClockInTime, useClockHistory, useNow } from "@/lib/store/clock";

/** Today's real clocked-in time, live if a session is open right now. */
export function useTodayClockedMs(): number {
  const clockInTime = useClockInTime();
  const history = useClockHistory();
  const now = useNow(clockInTime !== null);

  const todayKey = localDateKey(new Date());
  const fromHistory = history
    .filter((r) => localDateKey(new Date(r.clockOut)) === todayKey)
    .reduce((sum, r) => sum + (r.clockOut - r.clockIn), 0);

  const liveMs = clockInTime !== null ? Math.max(0, now - clockInTime) : 0;
  return fromHistory + liveMs;
}

/** "Focus time today" stat card - real elapsed clocked-in time, not an
 *  invented Deep Work/Meetings/Admin split with no data behind it. */
export function TodayFocusStat() {
  const ms = useTodayClockedMs();

  return (
    <StatCard
      icon={<IconClock />}
      value={ms === 0 ? "Not clocked in" : formatElapsed(ms).replace(/:\d\d$/, "")}
      label="Time clocked in today"
      pct={Math.min(100, Math.round((ms / REQUIRED_MS) * 50))}
      tone="sky"
    />
  );
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
