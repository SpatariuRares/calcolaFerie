import type { ISODateString, PublicHoliday } from './types.js';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISO(year: number, month: number, day: number): ISODateString {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addDays(iso: ISODateString, days: number): ISODateString {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

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
    { date: toISO(year, 1, 1), name: 'Capodanno', kind: 'national' },
    { date: toISO(year, 1, 6), name: 'Epifania', kind: 'national' },
    { date: toISO(year, 4, 25), name: 'Festa della Liberazione', kind: 'national' },
    { date: toISO(year, 5, 1), name: 'Festa dei Lavoratori', kind: 'national' },
    { date: toISO(year, 6, 2), name: 'Festa della Repubblica', kind: 'national' },
    { date: toISO(year, 8, 15), name: 'Ferragosto', kind: 'national' },
    { date: toISO(year, 11, 1), name: 'Ognissanti', kind: 'national' },
    { date: toISO(year, 12, 8), name: 'Immacolata Concezione', kind: 'national' },
    { date: toISO(year, 12, 25), name: 'Natale', kind: 'national' },
    { date: toISO(year, 12, 26), name: 'Santo Stefano', kind: 'national' },
  ];

  const easterDate = computeEaster(year);
  const pasquetta: PublicHoliday = {
    date: addDays(easterDate, 1),
    name: 'Lunedì di Pasqua',
    kind: 'pasquetta',
  };

  return [...fixed, pasquetta].sort((a, b) => a.date.localeCompare(b.date));
}

export function getPublicHolidaysForWindow(
  windowStart: ISODateString,
  windowEnd: ISODateString,
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
