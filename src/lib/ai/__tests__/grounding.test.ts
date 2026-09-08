import { describe, expect, it } from "vitest";
import { groundedInNumbers } from "../sites";

const allowed = new Set(["61", "17", "28", "6", "80", "72"]);

describe("narrative grounding guard (§07)", () => {
  it("accepts a paragraph using only supplied figures", () => {
    expect(
      groundedInNumbers("You completed 17 of 28 planned tasks, 61%.", allowed),
    ).toBe(true);
  });

  it("rejects an invented statistic", () => {
    expect(
      groundedInNumbers("You completed 17 of 28 tasks - a 43% improvement.", allowed),
    ).toBe(false);
  });

  it("accepts prose with no figures at all", () => {
    expect(groundedInNumbers("Your main pattern was overscheduling.", allowed)).toBe(true);
  });
});
