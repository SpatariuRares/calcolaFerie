import { describe, it, expect } from "vitest";
import { searchDestinations, DESTINATION_CATALOG } from "../src/destination-finder.js";

describe("destination-finder (content-generation)", () => {
  it("contains curated destination catalog entries with pricing information", () => {
    expect(DESTINATION_CATALOG.length).toBeGreaterThan(5);
    for (const dest of DESTINATION_CATALOG) {
      expect(dest.pricing).toBeDefined();
      expect(dest.pricing.budgetTier).toBeDefined();
      expect(dest.pricing.budgetLabel).toBeDefined();
      expect(dest.pricing.estimatedCostPerDay).toBeDefined();
    }
  });

  it("recommends city breaks for 3-day bridges", () => {
    const results = searchDestinations({ bridgeDays: 3, limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.destination.name);
    expect(names.some((n) => ["Barcellona", "Budapest", "Praga", "Parigi"].includes(n))).toBe(true);
  });

  it("filters destinations by maxBudgetTier = 'low'", () => {
    const results = searchDestinations({ maxBudgetTier: "low", limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.destination.pricing.budgetTier).toBe("low");
    }
  });

  it("filters destinations by category", () => {
    const results = searchDestinations({ category: "sea", limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.destination.category).toBe("sea");
    }
  });

  it("boosts by holiday name (e.g. Immacolata / 8 Dicembre)", () => {
    const results = searchDestinations({ holidayName: "Immacolata", limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    const topDest = results[0].destination;
    expect(topDest.recommendedHolidays.some((h) => h.includes("Immacolata") || h.includes("8 Dicembre"))).toBe(true);
  });
});
