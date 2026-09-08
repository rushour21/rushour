import { describe, expect, it } from "vitest";
import {
  addDays,
  atLocalTime,
  daysBetween,
  isoWeek,
  localDate,
  sessionDate,
  weekDates,
} from "@/lib/time";

describe("localDate", () => {
  it("resolves the calendar day in the user's timezone, not UTC", () => {
    // 2026-09-08 22:30 UTC is already the 9th in Kolkata (+05:30).
    const at = new Date("2026-09-08T22:30:00Z");
    expect(localDate("UTC", at)).toBe("2026-09-08");
    expect(localDate("Asia/Kolkata", at)).toBe("2026-09-09");
  });

  it("handles a westward timezone on the same instant", () => {
    const at = new Date("2026-09-09T02:00:00Z");
    expect(localDate("America/New_York", at)).toBe("2026-09-08");
  });
});

describe("sessionDate (REQ-020 rollover)", () => {
  it("attributes a 01:00 clock-in to the previous day", () => {
    const at = new Date("2026-09-09T01:00:00Z");
    expect(sessionDate("UTC", at)).toBe("2026-09-08");
  });

  it("attributes a 09:00 clock-in to the same day", () => {
    const at = new Date("2026-09-09T09:00:00Z");
    expect(sessionDate("UTC", at)).toBe("2026-09-09");
  });

  it("rolls over exactly at 04:00", () => {
    expect(sessionDate("UTC", new Date("2026-09-09T03:59:00Z"))).toBe("2026-09-08");
    expect(sessionDate("UTC", new Date("2026-09-09T04:00:00Z"))).toBe("2026-09-09");
  });
});

describe("date maths", () => {
  it("counts days across a month boundary", () => {
    expect(daysBetween("2026-08-30", "2026-09-02")).toBe(3);
  });

  it("adds days across a year boundary", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("keys the ISO week", () => {
    expect(isoWeek("2026-09-08")).toBe("2026-W37");
  });

  it("returns Monday-first week dates", () => {
    const w = weekDates("2026-09-08"); // a Tuesday
    expect(w).toHaveLength(7);
    expect(w[0]).toBe("2026-09-07");
    expect(w[6]).toBe("2026-09-13");
  });
});

describe("atLocalTime", () => {
  it("resolves a wall-clock time on the same day when it is still ahead", () => {
    const now = new Date("2026-09-08T09:00:00Z");
    const at = atLocalTime("UTC", "18:00", now);
    expect(at.toISOString()).toBe("2026-09-08T18:00:00.000Z");
  });

  it("returns an instant in the past when the time has already gone", () => {
    const now = new Date("2026-09-08T22:00:00Z");
    const at = atLocalTime("UTC", "18:00", now);
    expect(at.getTime()).toBeLessThan(now.getTime());
  });

  it("compares correctly across midnight, where string comparison fails", () => {
    // Three hours after 22:15 is 01:15 the next day. Comparing "18:00" >= "01:15"
    // as strings wrongly keeps 18:00 - as instants, 18:00 is clearly past.
    const now = new Date("2026-09-08T22:15:00Z");
    const historical = atLocalTime("UTC", "18:00", now);
    const soon = new Date(now.getTime() + 3 * 3600_000);
    expect(historical.getTime()).toBeLessThan(now.getTime());
    expect(soon.getTime()).toBeGreaterThan(now.getTime());
  });
});
