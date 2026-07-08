import { describe, expect, it } from "vitest";
import {
  addDays,
  dateToISO,
  isoDate,
  localToday,
  toISO,
  tryIsoDate,
  type ISODateString,
} from "@engine";

describe("branded ISODateString", () => {
  it("does not allow plain strings at compile time", () => {
    // @ts-expect-error ISODateString must go through the validating constructor.
    const plain: ISODateString = "2026-01-01";

    expect(plain).toBe("2026-01-01");
  });

  it("constructs valid ISO dates and rejects malformed input", () => {
    expect(isoDate("2026-02-28")).toBe("2026-02-28");
    expect(tryIsoDate("2026-02-28")).toBe("2026-02-28");

    expect(() => isoDate("")).toThrow(RangeError);
    expect(() => isoDate("2026-13-40")).toThrow(RangeError);
    expect(() => isoDate("not-a-date")).toThrow(RangeError);
    expect(tryIsoDate("not-a-date")).toBeNull();
  });

  it("returns branded values from trusted UTC producers", () => {
    const christmas = toISO(2026, 12, 25);
    const nextDay = addDays(christmas, 1);
    const fromDate = dateToISO(new Date("2026-12-27T12:30:00Z"));
    const today = localToday(new Date("2026-12-28T12:30:00"));

    const brandedValues: ISODateString[] = [christmas, nextDay, fromDate, today];

    expect(brandedValues).toEqual([
      "2026-12-25",
      "2026-12-26",
      "2026-12-27",
      "2026-12-28",
    ]);
  });

});
