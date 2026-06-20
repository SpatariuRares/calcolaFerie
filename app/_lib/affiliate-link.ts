/**
 * Travelpayouts affiliate deep-links for bridge opportunities.
 *
 * V1 is dates-only: we hand the provider a hotel search pre-filled with the
 * opportunity's check-in / check-out and let the user pick the destination
 * there. No destination is passed and we set no cookies of our own — any
 * cookie is set by the provider on their domain after the click.
 *
 * Lives in the app layer on purpose: the engine stays free of monetisation.
 */

/** Travelpayouts redirect endpoint that stamps the marker and forwards the click. */
const TRAVELPAYOUTS_REDIRECT_BASE = "https://tp.media/r";

/** Travelpayouts program id for Booking.com. */
const BOOKING_PROGRAM_ID = "4115";

/** Campaign id for the Booking.com search deep-link program. */
const BOOKING_CAMPAIGN_ID = "101";

/** Booking.com hotel search endpoint that accepts checkin/checkout params. */
const BOOKING_SEARCH_URL = "https://www.booking.com/searchresults.html";

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
 * Build a Travelpayouts deep-link to a Booking.com hotel search with the
 * opportunity's dates pre-filled. Pure: pass `marker` to test without env.
 */
export function buildBookingDeepLink(
  { startDate, endDate }: AffiliateDateRange,
  marker: string = affiliateMarker()
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
