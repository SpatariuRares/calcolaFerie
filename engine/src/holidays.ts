import type { ISODateString, PublicHoliday } from "./types";
import { addDays, toISO } from "./date";

// Anonymous Gregorian algorithm (computus)
export function computeEaster(year: number): ISODateString {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const g = Math.floor((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 19 * l) / 433);
  const n = Math.floor((h + l - 7 * m + 90) / 25);
  const p = (h + l - 7 * m + 33 * n + 19) % 32;
  return toISO(year, n, p);
}

export function getItalianPublicHolidays(year: number): PublicHoliday[] {
  const fixed: PublicHoliday[] = [
    { date: toISO(year, 1, 1), key: "newYear", kind: "national" },
    { date: toISO(year, 1, 6), key: "epiphany", kind: "national" },
    { date: toISO(year, 4, 25), key: "liberation", kind: "national" },
    { date: toISO(year, 5, 1), key: "labourDay", kind: "national" },
    { date: toISO(year, 6, 2), key: "republic", kind: "national" },
    { date: toISO(year, 8, 15), key: "assumption", kind: "national" },
    { date: toISO(year, 11, 1), key: "allSaints", kind: "national" },
    { date: toISO(year, 12, 8), key: "immaculateConception", kind: "national" },
    { date: toISO(year, 12, 25), key: "christmas", kind: "national" },
    { date: toISO(year, 12, 26), key: "stStephen", kind: "national" },
  ];

  const easterDate = computeEaster(year);
  const pasquetta: PublicHoliday = {
    date: addDays(easterDate, 1),
    key: "easterMonday",
    kind: "pasquetta",
  };

  return [...fixed, pasquetta].sort((a, b) => a.date.localeCompare(b.date));
}

export function getPublicHolidaysForWindow(
  windowStart: ISODateString,
  windowEnd: ISODateString
): PublicHoliday[] {
  const startYear = parseInt(windowStart.slice(0, 4), 10);
  const endYear = parseInt(windowEnd.slice(0, 4), 10);

  const seen = new Set<string>();
  const result: PublicHoliday[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (const holiday of getItalianPublicHolidays(year)) {
      if (holiday.date >= windowStart && holiday.date <= windowEnd && !seen.has(holiday.date)) {
        seen.add(holiday.date);
        result.push(holiday);
      }
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}
