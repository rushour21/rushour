import { describe, expect, it } from "vitest";
import { hasEnoughEvidence, successMetrics, type DayRecord } from "../metrics";

const day = (over: Partial<DayRecord> = {}): DayRecord => ({
  localDate: "2026-09-08",
  sealed: true,
  plannedMin: 120,
  doneMin: 120,
  plannedTasks: 3,
  completedTasks: 3,
  readinessScore: 70,
  reasons: [],
  ...over,
});

describe("success metrics (§01)", () => {
  it("reports nothing rather than zero when no day is sealed", () => {
    const m = successMetrics([day({ sealed: false }), day({ sealed: false })]);
    expect(m.completionRate).toBeNull();
    expect(m.avgTasksPlanned).toBeNull();
    expect(m.sealedDays).toBe(0);
  });

  it("computes the north star from sealed days only", () => {
    const m = successMetrics([
      day({ plannedTasks: 4, completedTasks: 2 }),
      day({ plannedTasks: 4, completedTasks: 4 }),
      day({ sealed: false, plannedTasks: 10, completedTasks: 0 }),
    ]);
    expect(m.completionRate).toBe(0.75); // 6 of 8, the unsealed day excluded
    expect(m.sealedDays).toBe(2);
  });

  it("counts days that hit the 70% threshold", () => {
    const m = successMetrics([
      day({ plannedTasks: 10, completedTasks: 7 }),
      day({ plannedTasks: 10, completedTasks: 6 }),
      day({ plannedTasks: 10, completedTasks: 10 }),
    ]);
    expect(m.onPlanDays).toBe(2);
  });

  it("flags shrinking ambition, so the rate cannot be gamed", () => {
    const m = successMetrics([
      day({ plannedTasks: 5, completedTasks: 2 }),
      day({ plannedTasks: 5, completedTasks: 2 }),
      day({ plannedTasks: 1, completedTasks: 1 }),
      day({ plannedTasks: 1, completedTasks: 1 }),
    ]);
    // Completion looks better, but only because far less was planned.
    expect(m.ambitionTrend).toBe("shrinking");
  });

  it("calls steady ambition steady", () => {
    const m = successMetrics([day(), day(), day(), day()]);
    expect(m.ambitionTrend).toBe("steady");
  });

  it("withholds a trend until there are four days behind it", () => {
    expect(successMetrics([day(), day(), day()]).ambitionTrend).toBeNull();
  });

  it("measures showing up against days available, not as a streak", () => {
    const m = successMetrics([day(), day({ sealed: false }), day(), day()]);
    expect(m.showUpRate).toBe(0.75);
  });

  it("tallies why things did not finish", () => {
    const m = successMetrics([
      day({ reasons: ["overscheduled", "distracted"] }),
      day({ reasons: ["overscheduled"] }),
    ]);
    expect(m.reasonHistogram).toEqual({ overscheduled: 2, distracted: 1 });
  });

  it("averages readiness over days that recorded it", () => {
    const m = successMetrics([
      day({ readinessScore: 80 }),
      day({ readinessScore: 60 }),
      day({ readinessScore: null }),
    ]);
    expect(m.avgReadiness).toBe(70);
  });

  it("knows when a rate is too thin to state", () => {
    expect(hasEnoughEvidence(2)).toBe(false);
    expect(hasEnoughEvidence(3)).toBe(true);
  });
});
