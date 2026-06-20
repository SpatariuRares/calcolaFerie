import { describe, it, expect } from 'vitest';
import {
  computeEaster,
  getItalianPublicHolidays,
  getPublicHolidaysForWindow,
  calculatePlan,
} from '../src/index.js';

describe('computeEaster', () => {
  it('2025 → 2025-04-20', () => {
    expect(computeEaster(2025)).toBe('2025-04-20');
  });
  it('2026 → 2026-04-05', () => {
    expect(computeEaster(2026)).toBe('2026-04-05');
  });
});

describe('getItalianPublicHolidays', () => {
  it('returns 11 holidays for 2026', () => {
    expect(getItalianPublicHolidays(2026)).toHaveLength(11);
  });

  it('includes Pasquetta on 2026-04-06', () => {
    const holidays = getItalianPublicHolidays(2026);
    const pasquetta = holidays.find((h) => h.kind === 'pasquetta');
    expect(pasquetta?.date).toBe('2026-04-06');
  });

  it('includes all 10 fixed national holidays', () => {
    const holidays = getItalianPublicHolidays(2026);
    const national = holidays.filter((h) => h.kind === 'national');
    expect(national).toHaveLength(10);
    const dates = national.map((h) => h.date);
    expect(dates).toContain('2026-01-01');
    expect(dates).toContain('2026-01-06');
    expect(dates).toContain('2026-04-25');
    expect(dates).toContain('2026-05-01');
    expect(dates).toContain('2026-06-02');
    expect(dates).toContain('2026-08-15');
    expect(dates).toContain('2026-11-01');
    expect(dates).toContain('2026-12-08');
    expect(dates).toContain('2026-12-25');
    expect(dates).toContain('2026-12-26');
  });
});

describe('getPublicHolidaysForWindow', () => {
  it('spans Dec 2026 → Jan 2027 without duplicates', () => {
    const holidays = getPublicHolidaysForWindow('2026-12-01', '2027-01-31');
    const dates = holidays.map((h) => h.date);
    const unique = new Set(dates);
    expect(dates.length).toBe(unique.size);
    expect(dates).toContain('2026-12-08');
    expect(dates).toContain('2026-12-25');
    expect(dates).toContain('2026-12-26');
    expect(dates).toContain('2027-01-01');
    expect(dates).toContain('2027-01-06');
  });
});

describe('calculatePlan', () => {
  it('throws not implemented', () => {
    expect(() =>
      calculatePlan({
        windowStart: '2026-01-01',
        windowEnd: '2026-12-31',
        workSchedule: { workDays: new Set([1, 2, 3, 4, 5]), consumeHolidaysOnPublicHolidays: false },
        publicHolidays: [],
        daysOff: [],
        totalVacationDays: 20,
      }),
    ).toThrow('not implemented');
  });
});
