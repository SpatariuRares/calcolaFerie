import { afterEach, describe, expect, it, vi } from "vitest";
import { affiliateMarker, buildBookingDeepLink } from "./affiliate-link";

describe("buildBookingDeepLink", () => {
  it("builds a Travelpayouts redirect carrying the marker", () => {
    const url = new URL(
      buildBookingDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }, "12345")
    );

    expect(url.origin + url.pathname).toBe("https://tp.media/r");
    expect(url.searchParams.get("marker")).toBe("12345");
  });

  it("pre-fills checkin/checkout from the opportunity dates", () => {
    const url = new URL(
      buildBookingDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }, "12345")
    );

    const target = new URL(url.searchParams.get("u") ?? "");
    expect(target.origin + target.pathname).toBe("https://www.booking.com/searchresults.html");
    expect(target.searchParams.get("checkin")).toBe("2026-04-23");
    expect(target.searchParams.get("checkout")).toBe("2026-04-27");
  });

  it("passes no destination in V1 (dates-only)", () => {
    const url = new URL(
      buildBookingDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }, "12345")
    );
    const target = new URL(url.searchParams.get("u") ?? "");

    expect(target.searchParams.has("ss")).toBe(false);
    expect(target.searchParams.has("dest_id")).toBe(false);
  });

  it("reads the marker from the NEXT_PUBLIC env var by default", () => {
    vi.stubEnv("NEXT_PUBLIC_TRAVELPAYOUTS_MARKER", "env-marker");

    expect(affiliateMarker()).toBe("env-marker");
    const url = new URL(buildBookingDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }));
    expect(url.searchParams.get("marker")).toBe("env-marker");
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});
