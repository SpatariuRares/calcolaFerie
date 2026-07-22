import { describe, expect, it, vi } from "vitest";
import { isoDate, type EngineOutput, type ISODateString } from "@engine";
import { calculateVacationPlan } from "./calculate-vacation-plan";
import { buildEngineInput } from "./engine-input";

describe("buildEngineInput", () => {
  it("builds a window ending 31 January of the next year and preserves user days off", () => {
    const input = buildEngineInput(
      {
        totalVacationDays: 20,
        daysOff: [
          { date: isoDate("2026-08-14"), type: "companyClosure" },
          { date: isoDate("2026-12-24"), type: "mandatoryLeave" },
        ],
      },
      new Date("2026-06-20T12:00:00")
    );

    expect(input.windowStart).toBe("2026-06-20");
    expect(input.windowEnd).toBe("2027-01-31");
    expect(input.totalVacationDays).toBe(20);
    expect(input.daysOff).toEqual([
      { date: "2026-08-14", type: "companyClosure" },
      { date: "2026-12-24", type: "mandatoryLeave" },
    ]);
    expect([...input.workSchedule.workDays]).toEqual([1, 2, 3, 4, 5]);
    expect(input.workSchedule.consumeHolidaysOnPublicHolidays).toBe(false);
  });

  it("adds the patron saint date as a public holiday inside the planning window", () => {
    const input = buildEngineInput(
      {
        totalVacationDays: 10,
        daysOff: [],
        patronSaintDate: isoDate("2026-06-24"),
      },
      new Date("2026-06-20T12:00:00")
    );

    expect(input.publicHolidays).toContainEqual({
      date: "2026-06-24",
      key: "patron",
      kind: "patron",
    });
  });

  it("filters incomplete or malformed day-off rows before calling the engine", () => {
    const input = buildEngineInput(
      {
        totalVacationDays: 10,
        daysOff: [
          { date: "" as ISODateString, type: "companyClosure" },
          { date: "not-a-date" as ISODateString, type: "companyClosure" },
          { date: isoDate("2026-11-02"), type: "mandatoryLeave" },
        ],
      },
      new Date("2026-06-20T12:00:00")
    );

    expect(input.daysOff).toEqual([{ date: "2026-11-02", type: "mandatoryLeave" }]);
  });

  it("drops a malformed patron saint date at the app boundary", () => {
    const input = buildEngineInput(
      {
        totalVacationDays: 10,
        daysOff: [],
        patronSaintDate: "2026-13-40" as ISODateString,
      },
      new Date("2026-06-20T12:00:00")
    );

    expect(input.publicHolidays).not.toContainEqual({
      date: "2026-13-40",
      key: "patron",
      kind: "patron",
    });
  });

  it("passes the built EngineInput to calculatePlan", () => {
    const output: EngineOutput = {
      opportunities: [],
      dayMap: new Map(),
      availableBudget: 12,
    };
    const runCalculatePlan = vi.fn(() => output);

    const calculation = calculateVacationPlan(
      {
        totalVacationDays: 12,
        daysOff: [{ date: isoDate("2026-12-24"), type: "mandatoryLeave" }],
        patronSaintDate: isoDate("2026-06-24"),
      },
      new Date("2026-06-20T12:00:00"),
      runCalculatePlan
    );

    expect(runCalculatePlan).toHaveBeenCalledOnce();
    expect(runCalculatePlan).toHaveBeenCalledWith(calculation.input);
    expect(calculation.output).toBe(output);
    expect(calculation.input.publicHolidays).toContainEqual({
      date: "2026-06-24",
      key: "patron",
      kind: "patron",
    });
  });
});
