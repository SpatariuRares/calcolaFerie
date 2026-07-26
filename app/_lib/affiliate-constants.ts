/**
 * Central registry of affiliate programs: static short links, Travelpayouts
 * ids, and the canonical program list (key + status + display order).
 *
 * Single source of truth so a new program (or a rotated link) only needs a
 * change here, not in every component that renders a program list.
 */

export type AffiliateProgramKey =
  | "booking"
  | "saily"
  | "klook"
  | "radicalstorage"
  | "getyourguide"
  | "expedia"
  | "hostelworld";

export type AffiliateProgramStatus = "active" | "planned";

export interface AffiliateProgramDefinition {
  key: AffiliateProgramKey;
  status: AffiliateProgramStatus;
}

/** Canonical list of affiliate programs, in display order. */
export const AFFILIATE_PROGRAMS: AffiliateProgramDefinition[] = [
  { key: "booking", status: "planned" },
  { key: "saily", status: "active" },
  { key: "klook", status: "active" },
  { key: "radicalstorage", status: "active" },
  { key: "getyourguide", status: "planned" },
  { key: "expedia", status: "planned" },
  { key: "hostelworld", status: "planned" },
];

/** Travelpayouts redirect endpoint that stamps the marker and forwards the click. */
export const TRAVELPAYOUTS_REDIRECT_BASE = "https://tp.media/r";

/** Travelpayouts program id for Booking.com. Override per-account via env. */
export const BOOKING_PROGRAM_ID = process.env.NEXT_PUBLIC_BOOKING_PROGRAM_ID ?? "4115";

/** Campaign id for the Booking.com search deep-link program. Override per-account via env. */
export const BOOKING_CAMPAIGN_ID = process.env.NEXT_PUBLIC_BOOKING_CAMPAIGN_ID ?? "101";

/** Booking.com hotel search endpoint that accepts checkin/checkout params. */
export const BOOKING_SEARCH_URL = "https://www.booking.com/searchresults.html";

/** Saily (eSIM data plans) affiliate link. Static short link. */
export const SAILY_AFFILIATE_URL = "https://saily.tpk.lv/8TRxDUYG";

/** Klook (tours, activities and experiences) affiliate link. Static short link. */
export const KLOOK_AFFILIATE_URL = "https://klook.tpk.lv/yIUkk6F3";

/** Radical Storage (luggage storage network) affiliate link. Static short link. */
export const RADICAL_STORAGE_AFFILIATE_URL = "https://radicalstorage.tpk.lv/JfpALpH8";
