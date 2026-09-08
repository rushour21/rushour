import { describe, expect, it } from "vitest";
import {
  achievements,
  DAYS_PER_REST,
  levelFor,
  MAX_REST_BANKED,
  streak,
  totalXp,
  XP,
} from "../progress";
import type { DayRecord } from "../metrics";

const d = (over: Partial<DayRecord> = {}): DayRecord => ({
  localDate: "2026-09-08",
  sealed: true,
  plannedMin: 60,
  doneMin: 60,
  plannedTasks: 2,
  completedTasks: 2,
  readinessScore: 70,
  reasons: [],
  tiers: { minimum: 0, target: 2, stretch: 0 },
  ...over,
});

const gap = () =>
  d({ sealed: false, plannedTasks: 0, completedTasks: 0, plannedMin: 0, doneMin: 0, tiers: undefined });

describe("streak (3.5)", () => {
  it("counts showing up, not finishing the plan", () => {
    // Three days where almost nothing got done, but each was closed honestly.
    const days = [0, 0, 0].map(() => d({ completedTasks: 0, doneMin: 0, tiers: { minimum: 0, target: 0, stretch: 0 } }));
    expect(streak(days).current).toBe(3);
  });

  it("earns a rest day every five days", () => {
    const s = streak(Array.from({ length: DAYS_PER_REST }, () => d()));
    expect(s.restBanked).toBe(1);
  });

  it("caps banked rest days", () => {
    const s = streak(Array.from({ length: DAYS_PER_REST * 5 }, () => d()));
    expect(s.restBanked).toBe(MAX_REST_BANKED);
  });

  it("survives one missed day when a rest day is banked", () => {
    const days = [...Array.from({ length: 5 }, () => d()), gap(), d()];
    const s = streak(days);
    expect(s.current).toBe(6); // five, the gap absorbed, then one more
    expect(s.protectedByRest).toBe(true);
    expect(s.restUsed).toBe(1);
    expect(s.restBanked).toBe(0);
  });

  it("breaks when a gap arrives with nothing banked", () => {
    const days = [d(), d(), gap(), d()];
    expect(streak(days).current).toBe(1);
  });

  it("remembers the best run even after a break", () => {
    const days = [...Array.from({ length: 4 }, () => d()), gap(), gap(), d()];
    const s = streak(days);
    expect(s.best).toBe(4);
    expect(s.current).toBe(1);
  });

  it("is zero with no history at all", () => {
    const s = streak([gap(), gap()]);
    expect(s.current).toBe(0);
    expect(s.best).toBe(0);
  });
});

describe("levels (3.6)", () => {
  it("rewards reaching the minimum tier, so a bad day still advances you", () => {
    const bad = d({
      completedTasks: 1,
      plannedTasks: 4,
      tiers: { minimum: 1, target: 0, stretch: 0 },
    });
    expect(totalXp([bad])).toBe(XP.sealedDay + XP.minimum);
    expect(totalXp([bad])).toBeGreaterThan(0);
  });

  it("pays more for target than minimum, and most for stretch", () => {
    expect(XP.minimum).toBeLessThan(XP.target);
    expect(XP.target).toBeLessThan(XP.stretch);
  });

  it("adds the on-plan bonus at the 70% threshold", () => {
    const onPlan = d({ plannedTasks: 10, completedTasks: 7, tiers: { minimum: 0, target: 0, stretch: 0 } });
    const under = d({ plannedTasks: 10, completedTasks: 6, tiers: { minimum: 0, target: 0, stretch: 0 } });
    expect(totalXp([onPlan]) - totalXp([under])).toBe(XP.onPlanDay);
  });

  it("ignores unsealed days entirely", () => {
    expect(totalXp([gap(), gap()])).toBe(0);
  });

  it("starts at level 1 with no progress", () => {
    const l = levelFor(0);
    expect(l.level).toBe(1);
    expect(l.intoLevel).toBe(0);
    expect(l.toNext).toBe(100);
  });

  it("levels up on the cumulative curve", () => {
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(249).level).toBe(2);
    expect(levelFor(250).level).toBe(3); // 100 + 150
  });

  it("keeps intoLevel inside the level's span", () => {
    for (const xp of [0, 50, 100, 260, 900, 5000]) {
      const l = levelFor(xp);
      expect(l.intoLevel).toBeGreaterThanOrEqual(0);
      expect(l.intoLevel).toBeLessThan(l.levelSpan);
      expect(l.intoLevel + l.toNext).toBe(l.levelSpan);
    }
  });
});

describe("achievements (3.7)", () => {
  const base = { calibrationN: 0, activeGoals: 2, laterGoals: 0 };

  it("awards nothing on an empty history", () => {
    const earned = achievements({ ...base, days: [gap(), gap()] }).filter((a) => a.earned);
    expect(earned).toHaveLength(0);
  });

  it("marks the first closed day", () => {
    const list = achievements({ ...base, days: [d()] });
    expect(list.find((a) => a.id === "closed-one")?.earned).toBe(true);
  });

  it("requires three on-plan days, and shows progress before that", () => {
    const days = [d({ plannedTasks: 10, completedTasks: 8 }), d({ plannedTasks: 10, completedTasks: 8 })];
    const a = achievements({ ...base, days }).find((x) => x.id === "on-plan-three")!;
    expect(a.earned).toBe(false);
    expect(a.progress).toEqual({ have: 2, need: 3 });
  });

  it("recognises a low-readiness day finished at minimum", () => {
    const days = [
      d({
        readinessScore: 40,
        plannedTasks: 2,
        completedTasks: 2,
        tiers: { minimum: 2, target: 0, stretch: 0 },
      }),
    ];
    expect(achievements({ ...base, days }).find((a) => a.id === "salvaged")?.earned).toBe(true);
  });

  it("does not award salvage for an easy day", () => {
    const days = [d({ readinessScore: 90 })];
    expect(achievements({ ...base, days }).find((a) => a.id === "salvaged")?.earned).toBe(false);
  });

  it("rewards actually parking something, not merely having two goals", () => {
    const none = achievements({ ...base, days: [d()], laterGoals: 0 });
    const parked = achievements({ ...base, days: [d()], laterGoals: 3 });
    expect(none.find((a) => a.id === "chose-two")?.earned).toBe(false);
    expect(parked.find((a) => a.id === "chose-two")?.earned).toBe(true);
  });

  it("awards calibration only once the multiplier is genuinely personal", () => {
    expect(
      achievements({ ...base, days: [d()], calibrationN: 19 }).find((a) => a.id === "calibrated")
        ?.earned,
    ).toBe(false);
    expect(
      achievements({ ...base, days: [d()], calibrationN: 20 }).find((a) => a.id === "calibrated")
        ?.earned,
    ).toBe(true);
  });

  it("finds five closed days inside a rolling week", () => {
    const days = [gap(), ...Array.from({ length: 5 }, () => d()), gap(), gap()];
    expect(achievements({ ...base, days }).find((a) => a.id === "honest-week")?.earned).toBe(true);
  });
});
