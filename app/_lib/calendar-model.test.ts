import { describe, expect, it } from "vitest";
import type { DayType, EngineInput, EngineOutput } from "@engine";
import {
  buildCalendarMonths,
  getCalendarDayLabel,
  isSelectableVacationDay,
} from "./calendar-model";

function baseInput(overrides: Partial<EngineInput> = {}): EngineInput {
  return {
    windowStart: "2026-06-20",
    windowEnd: "2027-06-20",
    workSchedule: {
      workDays: new Set([1, 2, 3, 4, 5]),
      consumeHolidaysOnPublicHolidays: false,
    },
    publicHolidays: [{ date: "2026-08-15", key: "assumption", kind: "national" }],
    daysOff: [],
    totalVacationDays: 20,
    ...overrides,
  };
}

function output(dayTypes: Record<string, DayType>): EngineOutput {
  return {
    opportunities: [],
    availableBudget: 20,
    dayMap: new Map(Object.entries(dayTypes)),
  };
}

describe("calendar model", () => {
  it("builds month rows from the rolling calculation window", () => {
    const months = buildCalendarMonths(
      baseInput(),
      output({
        "2026-06-19": "workday",
        "2026-06-20": "weekend",
        "2026-06-21": "weekend",
        "2027-06-20": "weekend",
        "2027-06-21": "workday",
      })
    );

    expect(months[0]).toMatchObject({
      key: "2026-06",
      label: "giugno 2026",
      leadingBlankDays: 5,
    });
    expect(months.at(-1)?.key).toBe("2027-06");
    expect(months[0].days.map((day) => day.iso)).toEqual(["2026-06-20", "2026-06-21"]);
    expect(months.at(-1)?.days.map((day) => day.iso)).toEqual(["2027-06-20"]);
  });

  it("keeps day types and holiday names from the engine output", () => {
    const months = buildCalendarMonths(
      baseInput(),
      output({
        "2026-08-14": "recommendedLeave",
        "2026-08-15": "publicHoliday",
        "2026-08-16": "weekend",
      })
    );

    const augustDays = months.find((month) => month.key === "2026-08")?.days;

    expect(augustDays).toContainEqual({
      iso: "2026-08-14",
      dayNumber: 14,
      type: "recommendedLeave",
      holidayName: undefined,
    });
    expect(augustDays).toContainEqual({
      iso: "2026-08-15",
      dayNumber: 15,
      type: "publicHoliday",
      holidayName: "Ferragosto",
    });
  });

  it("formats accessible tooltip labels with the holiday name when present", () => {
    expect(
      getCalendarDayLabel({
        iso: "2026-08-15",
        dayNumber: 15,
        type: "publicHoliday",
        holidayName: "Ferragosto",
      })
    ).toBe("15 agosto 2026 — Festivo — Ferragosto");
  });

  it("allows vacation selection only on days that can consume vacation", () => {
    expect(isSelectableVacationDay("workday")).toBe(true);
    expect(isSelectableVacationDay("recommendedLeave")).toBe(true);
    expect(isSelectableVacationDay("publicHoliday")).toBe(false);
    expect(isSelectableVacationDay("weekend")).toBe(false);
    expect(isSelectableVacationDay("companyClosure")).toBe(false);
    expect(isSelectableVacationDay("mandatoryLeave")).toBe(false);
  });
});
