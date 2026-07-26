import { describe, expect, it } from "vitest";
import { isPostVisible } from "./blog";

describe("isPostVisible", () => {
  it("keeps published posts without an expiry date visible", () => {
    expect(isPostVisible({ date: "2026-07-01" }, "2026-07-26")).toBe(true);
  });

  it("keeps posts visible through their expiry date", () => {
    expect(
      isPostVisible({ date: "2026-07-01", expiresAt: "2026-07-26" }, "2026-07-26")
    ).toBe(true);
  });

  it("hides posts after their expiry date", () => {
    expect(
      isPostVisible({ date: "2026-07-01", expiresAt: "2026-07-25" }, "2026-07-26")
    ).toBe(false);
  });

  it("keeps future posts hidden even when they have not expired", () => {
    expect(
      isPostVisible({ date: "2026-07-27", expiresAt: "2026-08-01" }, "2026-07-26")
    ).toBe(false);
  });
});
