import type { ISODateString } from "./types";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Canonical date helpers. All arithmetic is UTC: an ISODateString is treated as
 * UTC midnight, so day/month math never drifts across DST or timezone boundaries.
 * The only place local time is read is `localToday`, where "today" is meant in the
 * user's own calendar.
 */

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISO(year: number, month: number, day: number): ISODateString {
  return `${year}-${pad(month)}-${pad(day)}` as ISODateString;
}

export function isoToDate(iso: ISODateString): Date {
  return new Date(iso + "T00:00:00Z");
}

export function dateToISO(d: Date): ISODateString {
  return toISO(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function isoDate(value: string): ISODateString {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    throw new RangeError(`Invalid ISO date: ${JSON.stringify(value)}`);
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(value + "T00:00:00Z");

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() + 1 !== Number(month) ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    throw new RangeError(`Invalid ISO date: ${JSON.stringify(value)}`);
  }

  return value as ISODateString;
}

export function tryIsoDate(value: string): ISODateString | null {
  try {
    return isoDate(value);
  } catch {
    return null;
  }
}

export function isValidISODateString(value: unknown): value is ISODateString {
  return typeof value === "string" && tryIsoDate(value) !== null;
}

export function addDays(iso: ISODateString, days: number): ISODateString {
  const d = isoToDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToISO(d);
}

export function addMonths(iso: ISODateString, months: number): ISODateString {
  const d = isoToDate(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return dateToISO(d);
}

/** The user's local calendar day, captured as an ISODateString. */
export function localToday(now: Date = new Date()): ISODateString {
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
