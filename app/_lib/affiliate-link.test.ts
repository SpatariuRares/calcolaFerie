import { afterEach, describe, expect, it, vi } from "vitest";
import {
  affiliateMarker,
  awinAffiliateId,
  buildBookingDeepLink,
  buildLastminuteDeepLink,
} from "./affiliate-link";

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

describe("buildLastminuteDeepLink", () => {
  it("builds an Awin redirect carrying the merchant id and affiliate id", () => {
    const url = new URL(
      buildLastminuteDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }, "67890")
    );

    expect(url.origin + url.pathname).toBe("https://www.awin1.com/cread.php");
    expect(url.searchParams.get("awinmid")).toBe("12374");
    expect(url.searchParams.get("awinaffid")).toBe("67890");
  });

  it("points at the lastminute.com IT homepage", () => {
    const url = new URL(
      buildLastminuteDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" }, "67890")
    );

    expect(url.searchParams.get("p")).toBe("https://www.it.lastminute.com/");
  });

  it("reads the affiliate id from the NEXT_PUBLIC env var by default", () => {
    vi.stubEnv("NEXT_PUBLIC_AWIN_AFFILIATE_ID", "env-affid");

    expect(awinAffiliateId()).toBe("env-affid");
    const url = new URL(
      buildLastminuteDeepLink({ startDate: "2026-04-23", endDate: "2026-04-27" })
    );
    expect(url.searchParams.get("awinaffid")).toBe("env-affid");
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});
