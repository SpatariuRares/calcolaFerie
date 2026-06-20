import { describe, expect, it } from "vitest";
import type { BridgeOpportunity } from "@/engine/src/index";
import {
  formatDateRange,
  formatExplanation,
  getLevaTier,
  getSelectedOpportunityCost,
} from "./results-table";

function opportunity(overrides: Partial<BridgeOpportunity>): BridgeOpportunity {
  return {
    id: "bridge-1",
    startDate: "2026-08-14",
    endDate: "2026-08-17",
    staccoDays: 4,
    costDays: 1,
    leva: 4,
    recommendedDays: ["2026-08-14"],
    explanation: {
      anchorHolidayName: "Ferragosto",
      anchorWeekday: 6,
      costDays: 1,
      staccoDays: 4,
    },
    ...overrides,
  };
}

describe("results table formatting", () => {
  it("formats same-month and cross-month date ranges", () => {
    expect(formatDateRange("2026-08-14", "2026-08-17")).toBe("14–17 ago");
    expect(formatDateRange("2026-04-30", "2026-05-03")).toBe("30 apr–3 mag");
  });

  it("assembles a single-holiday explanation in Italian", () => {
    expect(formatExplanation(opportunity({}))).toBe(
      "Ferragosto cade sabato → 1 giorno di ferie = 4 giorni di stacco"
    );
  });

  it("assembles a fused-holiday explanation", () => {
    expect(
      formatExplanation(
        opportunity({
          costDays: 2,
          staccoDays: 6,
          explanation: {
            anchorHolidayName: "Pasqua",
            anchorWeekday: 0,
            costDays: 2,
            staccoDays: 6,
            fusedHolidayNames: ["Pasqua", "Pasquetta"],
          },
        })
      )
    ).toBe("Pasqua + Pasquetta → 2 giorni di ferie = 6 giorni di stacco");
  });

  it("uses the zero-cost explanation when no vacation is needed", () => {
    expect(
      formatExplanation(
        opportunity({
          costDays: 0,
          staccoDays: 3,
          explanation: {
            anchorHolidayName: "Chiusura aziendale",
            anchorWeekday: 5,
            costDays: 0,
            staccoDays: 3,
          },
        })
      )
    ).toBe("Nessuna feria necessaria — blocco già libero");
  });

  it("maps leva values to the expected tiers", () => {
    expect(getLevaTier(4)).toBe("high");
    expect(getLevaTier(2.5)).toBe("medium");
    expect(getLevaTier(2.49)).toBe("low");
  });

  it("sums the vacation cost for selected bridge opportunities", () => {
    const opportunities = [
      opportunity({ id: "bridge-1", costDays: 1 }),
      opportunity({ id: "bridge-2", costDays: 3 }),
      opportunity({ id: "bridge-3", costDays: 2 }),
    ];

    expect(getSelectedOpportunityCost(opportunities, new Set(["bridge-1", "bridge-3"]))).toBe(3);
  });
});
