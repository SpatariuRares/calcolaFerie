import { describe, expect, it } from "vitest";
import { calculatePlan } from "@engine";
import type {
  BridgeOpportunity,
  DayOff,
  EngineInput,
  PublicHoliday,
  WeekdayIndex,
  WorkSchedule,
} from "@engine";

const MONDAY_TO_FRIDAY = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

function schedule(overrides: Partial<WorkSchedule> = {}): WorkSchedule {
  return {
    workDays: MONDAY_TO_FRIDAY,
    consumeHolidaysOnPublicHolidays: false,
    ...overrides,
  };
}

function holiday(
  date: string,
  key = date,
  kind: PublicHoliday["kind"] = "national"
): PublicHoliday {
  return { date, key, kind };
}

function engineInput(overrides: Partial<EngineInput> = {}): EngineInput {
  return {
    windowStart: "2027-01-01",
    windowEnd: "2027-12-31",
    workSchedule: schedule(),
    publicHolidays: [],
    daysOff: [],
    totalVacationDays: 20,
    ...overrides,
  };
}

function onlyOpportunity(input: EngineInput): BridgeOpportunity {
  const output = calculatePlan(input);
  expect(output.opportunities).toHaveLength(1);
  return output.opportunities[0];
}

describe("calculatePlan full contract", () => {
  it("1. recommends the Friday bridge for a Thursday national holiday", () => {
    const opportunity = onlyOpportunity(
      engineInput({
        windowStart: "2027-03-29",
        windowEnd: "2027-04-04",
        publicHolidays: [holiday("2027-04-01", "thursday-holiday")],
      })
    );

    expect(opportunity.costDays).toBe(1);
    expect(opportunity.staccoDays).toBe(4);
    expect(opportunity.leva).toBe(4);
    expect(opportunity.recommendedDays).toEqual(["2027-04-02"]);
  });

  it("2. recommends the Friday before a Monday holiday", () => {
    const opportunity = onlyOpportunity(
      engineInput({
        windowStart: "2027-03-05",
        windowEnd: "2027-03-09",
        publicHolidays: [holiday("2027-03-08", "monday-holiday")],
      })
    );

    expect(opportunity.recommendedDays).toEqual(["2027-03-05"]);
    expect(opportunity.staccoDays).toBe(4);
    expect(opportunity.leva).toBe(4);
  });

  it("3. handles a Wednesday holiday by spending two surrounding workdays", () => {
    const opportunity = onlyOpportunity(
      engineInput({
        windowStart: "2027-03-01",
        windowEnd: "2027-03-07",
        publicHolidays: [holiday("2027-03-03", "wednesday-holiday")],
      })
    );

    expect(opportunity.costDays).toBe(2);
    expect(opportunity.staccoDays).toBe(5);
    expect(opportunity.leva).toBe(2.5);
    expect(opportunity.recommendedDays).toEqual(["2027-03-04", "2027-03-05"]);
  });

  it("4. returns Easter and Pasquetta as one already-free fused block", () => {
    const mondayToThursday = new Set<WeekdayIndex>([1, 2, 3, 4]);
    const opportunity = onlyOpportunity(
      engineInput({
        windowStart: "2026-04-03",
        windowEnd: "2026-04-06",
        workSchedule: schedule({ workDays: mondayToThursday }),
        publicHolidays: [
          holiday("2026-04-05", "easter", "easter"),
          holiday("2026-04-06", "pasquetta", "pasquetta"),
        ],
      })
    );

    expect(opportunity.costDays).toBe(0);
    expect(opportunity.staccoDays).toBeGreaterThanOrEqual(4);
    expect(opportunity.recommendedDays).toEqual([]);
    expect(opportunity.explanation.fusedHolidayKeys).toEqual(["easter", "pasquetta"]);
  });

  it("5. fuses two nearby holidays when the fused block gives better stacco", () => {
    const output = calculatePlan(
      engineInput({
        windowStart: "2027-03-01",
        windowEnd: "2027-03-14",
        publicHolidays: [holiday("2027-03-02", "holiday-a"), holiday("2027-03-05", "holiday-b")],
      })
    );

    expect(output.opportunities).toHaveLength(1);
    expect(output.opportunities[0].explanation.fusedHolidayKeys).toEqual([
      "holiday-a",
      "holiday-b",
    ]);
  });

  it("6. keeps far-apart holidays as two separate opportunities", () => {
    const output = calculatePlan(
      engineInput({
        windowStart: "2027-04-01",
        windowEnd: "2027-06-30",
        publicHolidays: [
          holiday("2027-04-01", "spring-holiday"),
          holiday("2027-06-02", "summer-holiday"),
        ],
      })
    );

    expect(output.opportunities).toHaveLength(2);
    expect(
      output.opportunities.map((opportunity) => opportunity.explanation.anchorHolidayKey)
    ).toEqual(["spring-holiday", "summer-holiday"]);
  });

  it("7. deducts mandatory leave from available budget", () => {
    const daysOff: DayOff[] = [
      { date: "2027-02-01", type: "mandatoryLeave" },
      { date: "2027-02-02", type: "mandatoryLeave" },
    ];

    const output = calculatePlan(engineInput({ totalVacationDays: 10, daysOff }));

    expect(output.availableBudget).toBe(8);
  });

  it("8. does not deduct company closures from available budget", () => {
    const daysOff: DayOff[] = [
      { date: "2027-02-01", type: "companyClosure" },
      { date: "2027-02-02", type: "companyClosure" },
    ];

    const output = calculatePlan(engineInput({ totalVacationDays: 10, daysOff }));

    expect(output.availableBudget).toBe(10);
  });

  it("9. lets a company closure extend a holiday block without adding cost", () => {
    const baseline = onlyOpportunity(
      engineInput({
        windowStart: "2027-03-29",
        windowEnd: "2027-04-04",
        publicHolidays: [holiday("2027-04-01", "thursday-holiday")],
      })
    );
    const withClosure = onlyOpportunity(
      engineInput({
        windowStart: "2027-03-29",
        windowEnd: "2027-04-04",
        publicHolidays: [holiday("2027-04-01", "thursday-holiday")],
        daysOff: [{ date: "2027-03-31", type: "companyClosure" }],
      })
    );

    expect(withClosure.costDays).toBe(baseline.costDays);
    expect(withClosure.staccoDays).toBeGreaterThan(baseline.staccoDays);
    expect(withClosure.recommendedDays).not.toContain("2027-03-31");
  });

  it("10. returns opportunities even when their cost exceeds the available budget", () => {
    const output = calculatePlan(
      engineInput({
        windowStart: "2027-05-29",
        windowEnd: "2027-06-06",
        publicHolidays: [holiday("2027-06-02", "republic-day")],
        totalVacationDays: 1,
      })
    );

    expect(output.availableBudget).toBe(1);
    expect(output.opportunities).toHaveLength(1);
    expect(output.opportunities[0].costDays).toBeGreaterThan(output.availableBudget);
  });

  it("11. classifies holiday, weekend, workday, closure, and mandatory days in dayMap", () => {
    const output = calculatePlan(
      engineInput({
        windowStart: "2027-04-01",
        windowEnd: "2027-04-06",
        publicHolidays: [holiday("2027-04-01", "holiday")],
        daysOff: [
          { date: "2027-04-02", type: "companyClosure" },
          { date: "2027-04-05", type: "mandatoryLeave" },
        ],
      })
    );

    expect(output.dayMap.get("2027-04-01")).toBe("publicHoliday");
    expect(output.dayMap.get("2027-04-03")).toBe("weekend");
    expect(output.dayMap.get("2027-04-06")).toBe("workday");
    expect(output.dayMap.get("2027-04-02")).toBe("companyClosure");
    expect(output.dayMap.get("2027-04-05")).toBe("mandatoryLeave");
  });

  it("12. never returns opportunity dates outside the requested window", () => {
    const windowStart = "2027-04-01";
    const windowEnd = "2027-06-30";
    const output = calculatePlan(
      engineInput({
        windowStart,
        windowEnd,
        publicHolidays: [
          holiday("2027-04-01", "spring-holiday"),
          holiday("2027-06-02", "summer-holiday"),
        ],
      })
    );

    expect(output.opportunities.length).toBeGreaterThan(0);
    for (const opportunity of output.opportunities) {
      expect(opportunity.startDate >= windowStart).toBe(true);
      expect(opportunity.endDate <= windowEnd).toBe(true);
    }
  });

  it("13. treats a patron saint date as a public holiday anchor", () => {
    const output = calculatePlan(
      engineInput({
        windowStart: "2027-03-29",
        windowEnd: "2027-04-04",
        publicHolidays: [holiday("2027-04-01", "patron-saint", "patron")],
      })
    );

    expect(output.dayMap.get("2027-04-01")).toBe("publicHoliday");
    expect(output.opportunities).toHaveLength(1);
    expect(output.opportunities[0].explanation.anchorHolidayKey).toBe("patron-saint");
  });

  it("14. consumes a public holiday inside the recommended period when configured", () => {
    const baseInput = engineInput({
      windowStart: "2027-03-29",
      windowEnd: "2027-04-04",
      publicHolidays: [holiday("2027-04-01", "thursday-holiday")],
      minBridgeLeverage: 2,
    });
    const defaultCost = onlyOpportunity(baseInput).costDays;
    const consumeCost = onlyOpportunity({
      ...baseInput,
      workSchedule: schedule({ consumeHolidaysOnPublicHolidays: true }),
    }).costDays;

    expect(consumeCost).toBe(defaultCost + 1);
  });
});
