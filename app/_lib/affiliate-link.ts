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

/** Travelpayouts program id for Booking.com. Override per-account via env. */
const BOOKING_PROGRAM_ID = process.env.NEXT_PUBLIC_BOOKING_PROGRAM_ID ?? "4115";

/** Campaign id for the Booking.com search deep-link program. Override per-account via env. */
const BOOKING_CAMPAIGN_ID = process.env.NEXT_PUBLIC_BOOKING_CAMPAIGN_ID ?? "101";

/** Booking.com hotel search endpoint that accepts checkin/checkout params. */
const BOOKING_SEARCH_URL = "https://www.booking.com/searchresults.html";

/** Awin redirect endpoint that stamps the affiliate id and forwards the click. */
const AWIN_REDIRECT_BASE = "https://www.awin1.com/cread.php";

/** Awin merchant id for lastminute.com IT (ui.awin.com/merchant-profile/12374). */
const LASTMINUTE_IT_MERCHANT_ID = process.env.NEXT_PUBLIC_LASTMINUTE_MERCHANT_ID ?? "12374";

/**
 * lastminute.com IT homepage. No confirmed flight-search URL/query params for
 * this brand yet (site blocks unauthenticated fetches), so v1 lands here
 * instead of guessing a path — dates aren't pre-filled.
 */
const LASTMINUTE_IT_URL = "https://www.it.lastminute.com/";

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

/**
 * The Awin publisher (affiliate) id — separate account/network from
 * Travelpayouts. Public identifier, safe client-side.
 */
export function awinAffiliateId(): string {
  return process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID ?? "";
}

/**
 * Build an Awin deep-link to lastminute.com IT. Pure: pass `affiliateId` to
 * test without env. `startDate`/`endDate` are accepted for parity with the
 * other builders but unused until lastminute.com's search URL is confirmed.
 */
export function buildLastminuteDeepLink(
  _dates: AffiliateDateRange,
  affiliateId: string = awinAffiliateId()
): string {
  const params = new URLSearchParams({
    awinmid: LASTMINUTE_IT_MERCHANT_ID,
    awinaffid: affiliateId,
    p: LASTMINUTE_IT_URL,
  });

  return `${AWIN_REDIRECT_BASE}?${params.toString()}`;
}
