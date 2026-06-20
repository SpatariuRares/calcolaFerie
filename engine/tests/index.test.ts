import { describe, it, expect } from 'vitest';
import {
  computeEaster,
  getItalianPublicHolidays,
  getPublicHolidaysForWindow,
  calculatePlan,
} from '../src/index.js';
import type { EngineInput, WeekdayIndex } from '../src/index.js';

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

// --- Shared fixtures for calculatePlan ------------------------------------
const MON_FRI = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);
const schedule = (consume = false) => ({
  workDays: MON_FRI,
  consumeHolidaysOnPublicHolidays: consume,
});

/** Build a full EngineInput from overrides, with sensible defaults. */
function input(over: Partial<EngineInput>): EngineInput {
  return {
    windowStart: '2027-01-01',
    windowEnd: '2027-12-31',
    workSchedule: schedule(),
    publicHolidays: [],
    daysOff: [],
    totalVacationDays: 20,
    ...over,
  };
}

describe('calculatePlan', () => {
  // Case 1 — single national holiday on a Thursday (2027-04-01 is a Thursday).
  it('1. Thursday holiday → take the Friday for a 4-day break', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', name: 'Festa Test', kind: 'national' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.costDays).toBe(1);
    expect(opp.staccoDays).toBe(4);
    expect(opp.leva).toBe(4);
    expect(opp.recommendedDays).toEqual(['2027-04-02']);
  });

  // Case 2 — holiday on a Monday (2027-11-01) → take the Friday before.
  it('2. Monday holiday → take the Friday before for a 4-day break', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-10-25',
        windowEnd: '2027-11-07',
        publicHolidays: [{ date: '2027-11-01', name: 'Ognissanti', kind: 'national' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.recommendedDays).toEqual(['2027-10-29']);
    expect(opp.staccoDays).toBe(4);
    expect(opp.leva).toBe(4);
  });

  // Case 3 — holiday on a Wednesday (2027-06-02). Two bridge days needed; the
  // engine explores both edges and returns the higher-leva 5-day span.
  it('3. Wednesday holiday → 2 bridge days for the best leva', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-05-29',
        windowEnd: '2027-06-06',
        publicHolidays: [{ date: '2027-06-02', name: 'Repubblica', kind: 'national' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.costDays).toBe(2);
    expect(opp.staccoDays).toBe(5);
    expect(opp.leva).toBe(2.5);
  });

  // Case 4 — Easter (Sun) + Pasquetta (Mon) fuse into one opportunity. The
  // engine only surfaces opportunities that spend at least one vacation day,
  // so it bridges the adjacent Friday: a single fused 4-day break.
  it('4. Easter + Pasquetta → single fused opportunity', () => {
    const out = calculatePlan(
      input({
        windowStart: '2026-04-01',
        windowEnd: '2026-04-12',
        publicHolidays: [
          { date: '2026-04-05', name: 'Pasqua', kind: 'easter' },
          { date: '2026-04-06', name: 'Pasquetta', kind: 'pasquetta' },
        ],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.explanation.fusedHolidayNames).toEqual(['Pasqua', 'Pasquetta']);
    expect(opp.staccoDays).toBeGreaterThanOrEqual(4);
    expect(opp.costDays).toBe(1);
  });

  // Case 5 — two holidays a short hop apart, where bridging both at once beats
  // treating them separately → a single fused opportunity.
  it('5. fused leva > split → single fused opportunity', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-11',
        publicHolidays: [
          { date: '2027-04-01', name: 'A', kind: 'national' },
          { date: '2027-04-05', name: 'B', kind: 'national' },
        ],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.explanation.fusedHolidayNames).toEqual(['A', 'B']);
    expect(opp.costDays).toBe(1);
    expect(opp.startDate).toBe('2027-04-01');
    expect(opp.endDate).toBe('2027-04-05');
  });

  // Case 6 — two holidays far apart stay as two separate opportunities.
  it('6. split leva > fused → two separate opportunities', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-04-01',
        windowEnd: '2027-06-30',
        publicHolidays: [
          { date: '2027-04-01', name: 'A', kind: 'national' },
          { date: '2027-06-02', name: 'B', kind: 'national' },
        ],
      }),
    );
    expect(out.opportunities).toHaveLength(2);
    expect(out.opportunities[0].startDate < out.opportunities[1].startDate).toBe(true);
  });

  // Case 7 — mandatoryLeave reduces the available budget, one per day.
  it('7. mandatoryLeave deducted from availableBudget', () => {
    const out = calculatePlan(
      input({
        totalVacationDays: 20,
        daysOff: [
          { date: '2027-03-02', type: 'mandatoryLeave' },
          { date: '2027-03-03', type: 'mandatoryLeave' },
        ],
      }),
    );
    expect(out.availableBudget).toBe(18);
  });

  // Case 8 — companyClosure does NOT touch the budget.
  it('8. companyClosure does not reduce availableBudget', () => {
    const out = calculatePlan(
      input({
        totalVacationDays: 20,
        daysOff: [
          { date: '2027-08-13', type: 'companyClosure' },
          { date: '2027-08-14', type: 'companyClosure' },
        ],
      }),
    );
    expect(out.availableBudget).toBe(20);
  });

  // Case 9 — a closure adjacent to a holiday extends the free block for free.
  it('9. companyClosure adjacent to holiday extends stacco without cost', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', name: 'Festa Test', kind: 'national' }],
        daysOff: [{ date: '2027-03-31', type: 'companyClosure' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    // Same single Friday of leave as case 1, but one extra free day in the span.
    expect(opp.costDays).toBe(1);
    expect(opp.staccoDays).toBe(5);
    expect(out.dayMap.get('2027-03-31')).toBe('companyClosure');
  });

  // Case 10 — an opportunity costing more than the budget is still reported.
  it('10. costDays > availableBudget → opportunity still present', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-05-29',
        windowEnd: '2027-06-06',
        publicHolidays: [{ date: '2027-06-02', name: 'Repubblica', kind: 'national' }],
        totalVacationDays: 1,
      }),
    );
    expect(out.availableBudget).toBe(1);
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].costDays).toBeGreaterThan(out.availableBudget);
  });

  // Case 11 — every DayType is classified correctly in the dayMap.
  it('11. dayMap classifies each DayType', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-04-01',
        windowEnd: '2027-04-30',
        publicHolidays: [{ date: '2027-04-01', name: 'Festa Test', kind: 'national' }],
        daysOff: [
          { date: '2027-04-20', type: 'companyClosure' },
          { date: '2027-04-21', type: 'mandatoryLeave' },
        ],
      }),
    );
    expect(out.dayMap.get('2027-04-01')).toBe('publicHoliday'); // holiday
    expect(out.dayMap.get('2027-04-04')).toBe('weekend'); // Sunday
    expect(out.dayMap.get('2027-04-13')).toBe('workday'); // untouched workday
    expect(out.dayMap.get('2027-04-20')).toBe('companyClosure'); // closure
    expect(out.dayMap.get('2027-04-21')).toBe('mandatoryLeave'); // mandatory
    expect(out.dayMap.get('2027-04-02')).toBe('recommendedLeave'); // bridge day
  });

  // Case 12 — no opportunity ever starts before windowStart or after windowEnd.
  it('12. opportunities stay within the window', () => {
    const windowStart = '2027-04-01';
    const windowEnd = '2027-06-30';
    const out = calculatePlan(
      input({
        windowStart,
        windowEnd,
        publicHolidays: [
          { date: '2027-04-01', name: 'A', kind: 'national' },
          { date: '2027-06-02', name: 'B', kind: 'national' },
        ],
      }),
    );
    expect(out.opportunities.length).toBeGreaterThan(0);
    for (const opp of out.opportunities) {
      expect(opp.startDate >= windowStart).toBe(true);
      expect(opp.endDate <= windowEnd).toBe(true);
    }
  });

  // Case 13 — a patron-saint date is treated as a public holiday.
  it('13. patron saint date is a publicHoliday', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', name: 'San Test', kind: 'patron' }],
      }),
    );
    expect(out.dayMap.get('2027-04-01')).toBe('publicHoliday');
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].explanation.anchorHolidayName).toBe('San Test');
  });

  // Case 14 — consuming holidays adds the in-span public holiday to the cost.
  it('14. consumeHolidaysOnPublicHolidays adds 1 to costDays', () => {
    const base = input({
      windowStart: '2027-03-29',
      windowEnd: '2027-04-04',
      publicHolidays: [{ date: '2027-04-01', name: 'Festa Test', kind: 'national' }],
    });
    const off = calculatePlan(base);
    const on = calculatePlan({ ...base, workSchedule: schedule(true) });
    expect(on.opportunities[0].costDays).toBe(off.opportunities[0].costDays + 1);
    expect(on.opportunities[0].costDays).toBe(2);
  });

  // Sanity check on the explanation weekday wiring (anchor on a Thursday = 4).
  it('exposes the anchor weekday in the explanation', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', name: 'Festa Test', kind: 'national' }],
      }),
    );
    const weekday: WeekdayIndex = out.opportunities[0].explanation.anchorWeekday;
    expect(weekday).toBe(4);
  });
});
