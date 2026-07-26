/**
 * Travelpayouts affiliate deep-links for bridge opportunities.
 *
 * V1 is dates-only: we hand the provider a hotel search pre-filled with the
 * opportunity's check-in / check-out and let the user pick the destination
 * there. No destination is passed and we set no cookies of our own — any
 * cookie is set by the provider on their domain after the click.
 *
 * Lives in the app layer on purpose: the engine stays free of monetisation.
 * Static ids/urls live in `affiliate-constants.ts`; this file only builds
 * links.
 */

import {
  BOOKING_CAMPAIGN_ID,
  BOOKING_PROGRAM_ID,
  BOOKING_SEARCH_URL,
  TRAVELPAYOUTS_REDIRECT_BASE,
} from "./affiliate-constants";

export interface AffiliateDateRange {
  startDate: string;
  endDate: string;
}

/**
 * The public Travelpayouts marker (affiliate id). It is a public identifier,
 * safe to expose client-side, so it ships as a `NEXT_PUBLIC_` env var.
 */
export function affiliateMarker(): string {
  return process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";
}

/**
 * A Travelpayouts account is approved per-program: the shared marker can be
 * rejected on a program it isn't (yet) enrolled in. Providers can set their
 * own `NEXT_PUBLIC_<PROVIDER>_MARKER` to override the shared one.
 */
function providerMarker(providerEnvVar: string | undefined): string {
  return providerEnvVar ?? affiliateMarker();
}

/**
 * Build a Travelpayouts deep-link to a Booking.com hotel search with the
 * opportunity's dates pre-filled. Pure: pass `marker` to test without env.
 */
export function buildBookingDeepLink(
  { startDate, endDate }: AffiliateDateRange,
  marker: string = providerMarker(process.env.NEXT_PUBLIC_BOOKING_MARKER)
): string {
  const target = `${BOOKING_SEARCH_URL}?checkin=${startDate}&checkout=${endDate}`;
  const params = new URLSearchParams({
    marker,
    p: BOOKING_PROGRAM_ID,
    campaign_id: BOOKING_CAMPAIGN_ID,
    u: target,
  });

  return `${TRAVELPAYOUTS_REDIRECT_BASE}?${params.toString()}`;
}
