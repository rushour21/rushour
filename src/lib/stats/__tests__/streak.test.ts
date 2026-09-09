import { describe, expect, it } from "vitest";
import { currentStreak } from "../streak";
import type { ClockRecord } from "@/lib/store/clock";

const day = (offsetDays: number, hour = 18): number => {
  const d = new Date("2026-09-10T00:00:00");
  d.setDate(d.getDate() - offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};
const now = new Date("2026-09-10T20:00:00");

describe("currentStreak", () => {
  it("is zero with no history", () => {
    expect(currentStreak([], now)).toBe(0);
  });

  it("counts today plus consecutive prior days", () => {
    const history: ClockRecord[] = [0, 1, 2].map((n) => ({
      clockIn: day(n, 9),
      clockOut: day(n),
    }));
    expect(currentStreak(history, now)).toBe(3);
  });

  it("stays alive if today has no session yet, counting from yesterday", () => {
    const history: ClockRecord[] = [1, 2, 3].map((n) => ({
      clockIn: day(n, 9),
      clockOut: day(n),
    }));
    expect(currentStreak(history, now)).toBe(3);
  });

  it("breaks on a skipped day", () => {
    const history: ClockRecord[] = [0, 2, 3].map((n) => ({
      clockIn: day(n, 9),
      clockOut: day(n),
    }));
    // Day 1 (yesterday) is missing, so only today counts.
    expect(currentStreak(history, now)).toBe(1);
  });

  it("counts one session per day even with multiple clock-outs that day", () => {
    const history: ClockRecord[] = [
      { clockIn: day(0, 9), clockOut: day(0, 12) },
      { clockIn: day(0, 14), clockOut: day(0, 17) },
    ];
    expect(currentStreak(history, now)).toBe(1);
  });
});
