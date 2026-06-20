import { describe, expect, it } from "vitest";
import {
  deserializeConfig,
  deserializeStoredConfig,
  getInitialUserConfig,
  serializeConfig,
} from "./user-config-url";

describe("user config URL persistence", () => {
  it("serializes the shareable config into URL params", () => {
    const params = serializeConfig({
      totalVacationDays: 20,
      daysOff: [
        { date: "2026-08-14", type: "companyClosure" },
        { date: "2026-12-24", type: "mandatoryLeave" },
      ],
      patronSaintDate: "2026-06-24",
    });

    expect(params.get("budget")).toBe("20");
    expect(params.get("daysOff")).toBe("2026-08-14:closure,2026-12-24:mandatory");
    expect(params.get("patron")).toBe("2026-06-24");
  });

  it("deserializes valid URL params into user config", () => {
    const config = deserializeConfig(
      new URLSearchParams(
        "budget=20&daysOff=2026-08-14:closure,2026-12-24:mandatory&patron=2026-06-24"
      )
    );

    expect(config).toEqual({
      totalVacationDays: 20,
      daysOff: [
        { date: "2026-08-14", type: "companyClosure" },
        { date: "2026-12-24", type: "mandatoryLeave" },
      ],
      patronSaintDate: "2026-06-24",
    });
  });

  it("returns null for invalid URL params", () => {
    expect(deserializeConfig(new URLSearchParams("budget=-1"))).toBeNull();
    expect(
      deserializeConfig(new URLSearchParams("budget=20&daysOff=2026-02-30:closure"))
    ).toBeNull();
    expect(deserializeConfig(new URLSearchParams("budget=20&daysOff=2026-12-24:other"))).toBeNull();
    expect(deserializeConfig(new URLSearchParams("budget=20&patron=not-a-date"))).toBeNull();
  });

  it("silently ignores corrupt stored config", () => {
    expect(deserializeStoredConfig("{")).toBeNull();
    expect(deserializeStoredConfig(null)).toBeNull();
    expect(deserializeStoredConfig(JSON.stringify({ totalVacationDays: 20 }))).toBeNull();
  });

  it("restores valid stored config", () => {
    expect(
      deserializeStoredConfig(
        JSON.stringify({
          totalVacationDays: 15,
          daysOff: [{ date: "2026-11-02", type: "mandatoryLeave" }],
          patronSaintDate: "2026-06-24",
        })
      )
    ).toEqual({
      totalVacationDays: 15,
      daysOff: [{ date: "2026-11-02", type: "mandatoryLeave" }],
      patronSaintDate: "2026-06-24",
    });
  });

  it("prefers URL params over stored config", () => {
    const storedValue = JSON.stringify({
      totalVacationDays: 10,
      daysOff: [{ date: "2026-08-14", type: "companyClosure" }],
    });

    expect(getInitialUserConfig(new URLSearchParams("budget=22"), storedValue)).toEqual({
      totalVacationDays: 22,
      daysOff: [],
    });
  });
});
