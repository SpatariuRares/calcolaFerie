import { describe, it, expect } from "vitest";
import {
  bestInterval,
  isFree,
  isScheduledWorkday,
  isValidBridgeInterval,
  isWeekdayAnchor,
  type Day,
} from "../src/bridge.js";
import type { DayType, WeekdayIndex } from "../src/index.js";

const WORK = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

/** Build a Day[] from (type, weekday) pairs. iso is a synthetic unique index. */
function days(...spec: [DayType, WeekdayIndex][]): Day[] {
  return spec.map(([type, weekday], i) => ({
    iso: `2026-01-${String(i + 1).padStart(2, "0")}`,
    weekday,
    type,
  }));
}

describe("isFree", () => {
  it("treats weekend, public holiday and company closure as free", () => {
    expect(isFree("weekend")).toBe(true);
    expect(isFree("publicHoliday")).toBe(true);
    expect(isFree("companyClosure")).toBe(true);
  });

  it("treats workdays and leave days as not free", () => {
    expect(isFree("workday")).toBe(false);
    expect(isFree("mandatoryLeave")).toBe(false);
    expect(isFree("recommendedLeave")).toBe(false);
  });
});

describe("isScheduledWorkday", () => {
  it("is true only when the weekday is in the work schedule", () => {
    const [mon] = days(["weekend", 1]);
    const [sun] = days(["weekend", 0]);
    expect(isScheduledWorkday(mon, WORK)).toBe(true);
    expect(isScheduledWorkday(sun, WORK)).toBe(false);
  });
});

describe("isWeekdayAnchor", () => {
  it("is true for a public holiday or closure that falls on a scheduled workday", () => {
    const [holidayTue] = days(["publicHoliday", 2]);
    const [closureWed] = days(["companyClosure", 3]);
    expect(isWeekdayAnchor(holidayTue, WORK)).toBe(true);
    expect(isWeekdayAnchor(closureWed, WORK)).toBe(true);
  });

  it("is false for a holiday on a non-working day or for a plain workday", () => {
    const [holidaySun] = days(["publicHoliday", 0]);
    const [plainMon] = days(["workday", 1]);
    expect(isWeekdayAnchor(holidaySun, WORK)).toBe(false);
    expect(isWeekdayAnchor(plainMon, WORK)).toBe(false);
  });
});

describe("isValidBridgeInterval", () => {
  it("accepts an already-free interval containing no workday to spend", () => {
    const d = days(["weekend", 6], ["publicHoliday", 0], ["weekend", 0]);
    expect(isValidBridgeInterval(d, WORK, 0, 2, 1, 1)).toBe(true);
  });

  it("rejects a workday hanging past the right cover edge", () => {
    const d = days(["publicHoliday", 1], ["workday", 2]);
    expect(isValidBridgeInterval(d, WORK, 0, 1, 0, 0)).toBe(false);
  });

  it("accepts a weekend-anchored bridge onto a holiday", () => {
    const d = days(["weekend", 6], ["workday", 1], ["publicHoliday", 2]);
    expect(isValidBridgeInterval(d, WORK, 0, 2, 2, 2)).toBe(true);
  });

  it("rejects a left workday run glued to the anchor with no rest day between", () => {
    const d = days(["workday", 1], ["publicHoliday", 2]);
    expect(isValidBridgeInterval(d, WORK, 0, 1, 1, 1)).toBe(false);
  });

  it("accepts a left workday run separated from the anchor by a rest day", () => {
    const d = days(["workday", 1], ["weekend", 6], ["publicHoliday", 1]);
    expect(isValidBridgeInterval(d, WORK, 0, 2, 2, 2)).toBe(true);
  });
});

describe("bestInterval", () => {
  it("returns the longest valid span with its cost and leverage", () => {
    const d = days(["weekend", 6], ["workday", 1], ["publicHoliday", 2]);
    const best = bestInterval(d, WORK, false, 2, 0, 2, 2, 2);
    expect(best).toEqual({ start: 0, end: 2, stacco: 3, cost: 1, leva: 3, recommended: [1] });
  });

  it("returns null when no paid candidate clears the minimum leverage", () => {
    const d = days(["workday", 1]);
    expect(bestInterval(d, WORK, false, 4, 0, 0, 0, 0)).toBeNull();
  });

  it("returns a zero-cost interval when there is no workday to spend", () => {
    const d = days(["weekend", 6], ["publicHoliday", 0], ["weekend", 0]);
    expect(bestInterval(d, WORK, false, 2, 0, 1, 1, 2)).toEqual({
      start: 0,
      end: 2,
      stacco: 3,
      cost: 0,
      leva: 0,
      recommended: [],
    });
  });
});
