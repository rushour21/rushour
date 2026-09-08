import { describe, expect, it } from "vitest";
import {
  adapt,
  calibrate,
  capacity,
  drift,
  fitToWindow,
  hm,
  PRIOR_MULTIPLIER,
  rank,
  readiness,
  type PlanItem,
} from "../index";

const task = (
  id: string,
  target: number,
  extra: Partial<PlanItem> = {},
): PlanItem => ({
  nodeId: id,
  title: id,
  estimateMin: { minimum: Math.round(target * 0.25), target, stretch: target * 2 },
  ...extra,
});

describe("capacity (§06.1)", () => {
  it("blocks the spec's worked example: 15h40m into a ~6h day", () => {
    // 24h day, minus work 8h, sleep 7.5h, commute 1h, meals 2h, life 2h.
    const v = capacity({
      windowMin: 24 * 60,
      fixedMin: (8 + 7.5 + 1 + 2 + 2) * 60,
      items: [
        task("react", 120),
        task("node", 120),
        task("sysdesign", 120),
        task("apply", 120),
        task("gym", 60),
        task("news", 60),
        task("project", 240),
        task("book", 60),
      ],
      multiplier: 1,
      utilization: 1,
      band: "HIGH",
    });

    expect(v.demandMin).toBe(900); // 15h
    expect(v.overloaded).toBe(true);
    expect(v.availableMin).toBeLessThan(v.demandMin);
  });

  it("reserves a buffer before anything can be planned", () => {
    const v = capacity({
      windowMin: 600,
      fixedMin: 0,
      items: [],
      multiplier: 1,
      utilization: 1,
      band: "HIGH",
    });
    expect(v.bufferMin).toBe(72); // 12%
    expect(v.availableMin).toBe(528);
  });

  it("applies the personal multiplier to demand", () => {
    const base = { windowMin: 600, fixedMin: 0, items: [task("a", 100)], utilization: 1, band: "HIGH" as const };
    expect(capacity({ ...base, multiplier: 1 }).demandMin).toBe(100);
    expect(capacity({ ...base, multiplier: 1.4 }).demandMin).toBe(140);
  });

  it("shrinks available capacity on a low-readiness day", () => {
    const base = { windowMin: 600, fixedMin: 0, items: [], multiplier: 1, utilization: 1 };
    const high = capacity({ ...base, band: "HIGH" }).availableMin;
    const low = capacity({ ...base, band: "LOW" }).availableMin;
    expect(low).toBeLessThan(high);
    expect(low).toBe(Math.round(high * 0.55));
  });

  it("flags underplanning without blocking", () => {
    const v = capacity({
      windowMin: 600,
      fixedMin: 0,
      items: [task("a", 30)],
      multiplier: 1,
      utilization: 1,
      band: "HIGH",
    });
    expect(v.underplanned).toBe(true);
    expect(v.overloaded).toBe(false);
  });

  it("never reports negative available minutes when fixed time exceeds the window", () => {
    const v = capacity({
      windowMin: 300,
      fixedMin: 600,
      items: [],
      multiplier: 1,
      utilization: 1,
      band: "HIGH",
    });
    expect(v.availableMin).toBe(0);
  });
});

describe("hm formatting", () => {
  it("states overage in hours and minutes", () => {
    expect(hm(135)).toBe("2h 15m");
    expect(hm(45)).toBe("45m");
    expect(hm(120)).toBe("2h");
    expect(hm(-90)).toBe("-1h 30m");
  });
});

describe("fitToWindow (rescue, REQ-041)", () => {
  it("keeps what fits at minimum tier and defers the rest", () => {
    const items = [task("a", 120), task("b", 120), task("c", 120)];
    const { keep, defer, usedMin } = fitToWindow(items, 60, 1, "minimum");
    expect(keep).toHaveLength(2); // 30 + 30
    expect(defer).toHaveLength(1);
    expect(usedMin).toBe(60);
  });
});

describe("calibration (§06.2, REQ-074)", () => {
  it("returns the global prior with no evidence", () => {
    const c = calibrate([]);
    expect(c.multiplier).toBe(PRIOR_MULTIPLIER);
    expect(c.n).toBe(0);
    expect(c.confident).toBe(false);
  });

  it("converges toward the person as evidence accumulates", () => {
    const consistent = Array.from({ length: 40 }, () => ({
      estimateTargetMin: 60,
      actualMin: 120, // always 2x
    }));
    const few = calibrate(consistent.slice(0, 4));
    const many = calibrate(consistent);

    expect(few.multiplier).toBeLessThan(many.multiplier);
    expect(many.multiplier).toBeGreaterThan(1.7);
    expect(many.multiplier).toBeLessThan(2.0);
  });

  it("resists a single extreme overrun (geometric, not arithmetic)", () => {
    const normal = Array.from({ length: 10 }, () => ({
      estimateTargetMin: 60,
      actualMin: 60,
    }));
    const withOutlier = [...normal, { estimateTargetMin: 60, actualMin: 600 }];
    const c = calibrate(withOutlier);
    // An arithmetic mean would land near 1.8; the geometric mean stays sane.
    expect(c.multiplier).toBeLessThan(1.5);
  });

  it("excludes suspect observations", () => {
    const obs = [
      { estimateTargetMin: 60, actualMin: 60 },
      { estimateTargetMin: 60, actualMin: 600, suspect: true },
    ];
    expect(calibrate(obs).n).toBe(1);
  });

  it("clamps to the documented range", () => {
    const wild = Array.from({ length: 40 }, () => ({
      estimateTargetMin: 1,
      actualMin: 1000,
    }));
    expect(calibrate(wild).multiplier).toBeLessThanOrEqual(3.0);
  });
});

describe("readiness (§06.3, REQ-060)", () => {
  it("scores a rested, low-stress day HIGH", () => {
    const r = readiness({ sleepHours: 8, sleepTargetHours: 7.5, energy: 5, stress: 1 });
    expect(r.band).toBe("HIGH");
    expect(r.factor).toBe(1);
  });

  it("scores a short, stressed night LOW", () => {
    const r = readiness({ sleepHours: 4, sleepTargetHours: 7.5, energy: 2, stress: 5 });
    expect(r.band).toBe("LOW");
    expect(r.factor).toBe(0.55);
  });

  it("exposes every component so the score can be audited", () => {
    const r = readiness({ sleepHours: 7.5, sleepTargetHours: 7.5, energy: 3, stress: 3 });
    expect(r.components.sleep).toBe(100);
    expect(r.components.energy).toBe(60);
    expect(r.components.stress).toBe(60);
    expect(Object.values(r.weights).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it("penalises a day following an over-capacity day", () => {
    const rested = readiness({ sleepHours: 8, sleepTargetHours: 8, energy: 4, stress: 2, yesterdayLoad: 0.8 });
    const hammered = readiness({ sleepHours: 8, sleepTargetHours: 8, energy: 4, stress: 2, yesterdayLoad: 1.8 });
    expect(hammered.score).toBeLessThan(rested.score);
  });
});

describe("drift (§06.4, REQ-050)", () => {
  it("stays silent without enough observations", () => {
    expect(drift([{ deviationMin: 60 }]).alert).toBe(false);
  });

  it("detects a wake time sliding later", () => {
    // 25, 40, 18, 50, 10, 35, 45 minutes past target across a fortnight
    const obs = [0, 8, 15, 22, 30, 38, 45, 52, 60, 68].map((d) => ({ deviationMin: d }));
    const d = drift(obs);
    expect(d.alert).toBe(true);
    expect(d.slopeMinPerDay).toBeGreaterThan(4);
    expect(d.message).toContain("later per day");
  });

  it("does not alert on a stable habit, even an imperfect one", () => {
    const obs = [5, -3, 8, 2, -6, 4, 1, -2, 6, 0].map((d) => ({ deviationMin: d }));
    expect(drift(obs).alert).toBe(false);
  });
});

describe("ranking (§06.5, REQ-040)", () => {
  it("prefers work that fits the remaining block", () => {
    const items = [task("long", 180, { weight: 5 }), task("short", 30, { weight: 4 })];
    const [top] = rank(items, { blockRemainingMin: 45, multiplier: 1, band: "MEDIUM" });
    expect(top.item.nodeId).toBe("short");
    expect(top.fits).toBe(true);
  });

  it("always supplies the reason it won", () => {
    const [top] = rank([task("a", 30)], { blockRemainingMin: 60, multiplier: 1, band: "HIGH" });
    expect(top.reason).toContain("fits your remaining");
  });

  it("penalises switching away from the current goal", () => {
    const items = [
      task("same", 30, { goalId: "g1", weight: 3 }),
      task("other", 30, { goalId: "g2", weight: 3 }),
    ];
    const ranked = rank(items, {
      blockRemainingMin: 60,
      multiplier: 1,
      band: "MEDIUM",
      currentGoalId: "g1",
    });
    expect(ranked[0].item.nodeId).toBe("same");
  });

  it("is deterministic", () => {
    const items = [task("a", 30, { weight: 3 }), task("b", 45, { weight: 4 })];
    const ctx = { blockRemainingMin: 60, multiplier: 1.4, band: "HIGH" as const, now: new Date("2026-09-08") };
    expect(rank(items, ctx).map((r) => r.item.nodeId)).toEqual(
      rank(items, ctx).map((r) => r.item.nodeId),
    );
  });

  it("deprioritises deep work on a low-readiness day", () => {
    const items = [task("deep", 120, { weight: 3 }), task("admin", 20, { weight: 3 })];
    const [top] = rank(items, { blockRemainingMin: 240, multiplier: 1, band: "LOW" });
    expect(top.item.nodeId).toBe("admin");
  });
});

describe("adaptation (§06.6, REQ-072)", () => {
  it("holds the load when there are too few closed days to judge", () => {
    const a = adapt(0.8, 1.0, 1);
    expect(a.adapted).toBe(false);
    expect(a.utilization).toBe(0.8);
    expect(a.message).toContain("Not enough closed days");
  });

  it("cuts the load after an overcommitted week", () => {
    const a = adapt(0.8, 0.5);
    expect(a.utilization).toBeLessThan(0.8);
    expect(a.message).toContain("Reducing");
  });

  it("raises the load after beating the target", () => {
    const a = adapt(0.7, 0.95);
    expect(a.utilization).toBeGreaterThan(0.7);
    expect(a.message).toContain("Raising");
  });

  it("holds steady at the 80% target", () => {
    expect(adapt(0.8, 0.8).utilization).toBe(0.8);
  });

  it("cannot collapse on one anomalous week", () => {
    const a = adapt(0.8, 0);
    expect(a.utilization).toBeGreaterThanOrEqual(0.65);
  });

  it("stays inside the documented bounds after many bad weeks", () => {
    let u = 0.8;
    for (let i = 0; i < 20; i++) u = adapt(u, 0).utilization;
    expect(u).toBe(0.5);
  });
});

describe("session window capping", () => {
  const MAX_SESSION_WINDOW_MIN = 16 * 60;

  /** Mirrors resolvePlannedOut in lib/actions/session.ts. */
  function resolvePlannedOut(hhmm: string, now: Date): Date {
    const [h, m] = hhmm.split(":").map(Number);
    const out = new Date(now);
    out.setHours(h, m, 0, 0);
    if (out.getTime() <= now.getTime()) out.setDate(out.getDate() + 1);
    const cap = now.getTime() + MAX_SESSION_WINDOW_MIN * 60_000;
    return out.getTime() > cap ? new Date(cap) : out;
  }

  it("caps a clock-out that rolled into tomorrow evening", () => {
    // 22:00 now, finishing "18:00" would resolve to tomorrow - a 20 hour day.
    const now = new Date("2026-09-08T22:00:00");
    const out = resolvePlannedOut("18:00", now);
    const windowMin = (out.getTime() - now.getTime()) / 60_000;
    expect(windowMin).toBe(MAX_SESSION_WINDOW_MIN);
  });

  it("leaves an ordinary working day untouched", () => {
    const now = new Date("2026-09-08T09:00:00");
    const out = resolvePlannedOut("18:00", now);
    expect((out.getTime() - now.getTime()) / 60_000).toBe(540);
  });

  it("still allows a genuine post-midnight finish", () => {
    const now = new Date("2026-09-08T22:00:00");
    const out = resolvePlannedOut("02:00", now);
    expect((out.getTime() - now.getTime()) / 60_000).toBe(240);
  });
});
