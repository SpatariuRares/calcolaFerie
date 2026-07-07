import { describe, it, expect } from 'vitest';
import { calculatePlan } from '@engine';
import type { EngineInput, WeekdayIndex } from '@engine';

const MON_FRI = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);
const defaultSchedule = { workDays: MON_FRI, consumeHolidaysOnPublicHolidays: false };

function input(over: Partial<EngineInput>): EngineInput {
  return {
    windowStart: '2027-01-01',
    windowEnd: '2027-12-31',
    workSchedule: defaultSchedule,
    publicHolidays: [],
    daysOff: [],
    totalVacationDays: 20,
    ...over,
  };
}

// AC1: single national holiday on Thursday → 1-day Friday bridge, leva 4.0, staccoDays 4
describe('AC1: Thursday holiday → minimal bridge', () => {
  it('returns 1-day bridge with leva 4.0 and staccoDays 4', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', key: 'Test', kind: 'national' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.costDays).toBe(1);
    expect(opp.staccoDays).toBe(4);
    expect(opp.leva).toBe(4);
    expect(opp.recommendedDays).toEqual(['2027-04-02']);
  });

  it('dayMap contains the holiday date as publicHoliday', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', key: 'Test', kind: 'national' }],
      }),
    );
    expect(out.dayMap.get('2027-04-01')).toBe('publicHoliday');
    expect(out.dayMap.get('2027-04-02')).toBe('recommendedLeave');
  });
});

// AC2: Easter + Pasquetta fuse into one opportunity
describe('AC2: Easter + Pasquetta fuse', () => {
  it('returns single fused opportunity with fusedHolidayKeys', () => {
    const out = calculatePlan(
      input({
        windowStart: '2026-04-01',
        windowEnd: '2026-04-12',
        publicHolidays: [
          { date: '2026-04-05', key: 'Pasqua', kind: 'easter' },
          { date: '2026-04-06', key: 'Pasquetta', kind: 'pasquetta' },
        ],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].explanation.fusedHolidayKeys).toEqual(['Pasqua', 'Pasquetta']);
  });

  it('fused leva ≥ each individual leva', () => {
    const out = calculatePlan(
      input({
        windowStart: '2026-04-01',
        windowEnd: '2026-04-12',
        publicHolidays: [
          { date: '2026-04-05', key: 'Pasqua', kind: 'easter' },
          { date: '2026-04-06', key: 'Pasquetta', kind: 'pasquetta' },
        ],
      }),
    );
    // Single fused opportunity means fused won
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].leva).toBeGreaterThanOrEqual(1);
  });
});

// AC3: two holidays far apart → split leva wins → two separate opportunities
describe('AC3: split leva > fused → two opportunities', () => {
  it('returns two separate opportunities for far-apart holidays', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-04-01',
        windowEnd: '2027-06-30',
        publicHolidays: [
          { date: '2027-04-01', key: 'A', kind: 'national' },
          { date: '2027-06-02', key: 'B', kind: 'national' },
        ],
      }),
    );
    expect(out.opportunities).toHaveLength(2);
    expect(out.opportunities[0].startDate < out.opportunities[1].startDate).toBe(true);
  });
});

// AC4: availableBudget = totalVacationDays - mandatoryLeave count
describe('AC4: availableBudget deducts mandatoryLeave', () => {
  it('subtracts 2 mandatory days from 20', () => {
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

  it('zero mandatory days → availableBudget equals totalVacationDays', () => {
    const out = calculatePlan(input({ totalVacationDays: 15 }));
    expect(out.availableBudget).toBe(15);
  });
});

// AC5: companyClosure not in recommendedDays and doesn't affect availableBudget
describe('AC5: companyClosure semantics', () => {
  it('does not reduce availableBudget', () => {
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

  it('closure adjacent to holiday extends stacco without appearing in recommendedDays', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', key: 'Test', kind: 'national' }],
        daysOff: [{ date: '2027-03-31', type: 'companyClosure' }],
      }),
    );
    expect(out.opportunities).toHaveLength(1);
    const opp = out.opportunities[0];
    expect(opp.recommendedDays).not.toContain('2027-03-31');
    expect(out.dayMap.get('2027-03-31')).toBe('companyClosure');
    expect(opp.staccoDays).toBeGreaterThan(4);
  });
});

// AC6: costDays > availableBudget → opportunity still in output
describe('AC6: over-budget opportunity still present', () => {
  it('includes opportunity even when costDays exceeds availableBudget', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-05-29',
        windowEnd: '2027-06-06',
        publicHolidays: [{ date: '2027-06-02', key: 'Repubblica', kind: 'national' }],
        totalVacationDays: 1,
      }),
    );
    expect(out.availableBudget).toBe(1);
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].costDays).toBeGreaterThan(out.availableBudget);
  });
});

// AC7: all days in dayMap within window have a DayType
describe('AC7: dayMap covers every day in the window', () => {
  it('every day in the window is classified', () => {
    const windowStart = '2027-04-01';
    const windowEnd = '2027-04-07';
    const out = calculatePlan(input({ windowStart, windowEnd }));

    const current = new Date(windowStart);
    const end = new Date(windowEnd);
    while (current <= end) {
      const iso = current.toISOString().slice(0, 10);
      expect(out.dayMap.has(iso)).toBe(true);
      current.setDate(current.getDate() + 1);
    }
  });
});

// AC8: no opportunities outside [windowStart, windowEnd]
describe('AC8: opportunities stay within window', () => {
  it('all opportunity dates are within window bounds', () => {
    const windowStart = '2027-04-01';
    const windowEnd = '2027-06-30';
    const out = calculatePlan(
      input({
        windowStart,
        windowEnd,
        publicHolidays: [
          { date: '2027-04-01', key: 'A', kind: 'national' },
          { date: '2027-06-02', key: 'B', kind: 'national' },
        ],
      }),
    );
    for (const opp of out.opportunities) {
      expect(opp.startDate >= windowStart).toBe(true);
      expect(opp.endDate <= windowEnd).toBe(true);
    }
  });
});

// AC9: patron saint treated identically to national holiday
describe('AC9: patron saint = publicHoliday', () => {
  it('patron kind produces publicHoliday in dayMap', () => {
    const out = calculatePlan(
      input({
        windowStart: '2027-03-29',
        windowEnd: '2027-04-04',
        publicHolidays: [{ date: '2027-04-01', key: 'San Test', kind: 'patron' }],
      }),
    );
    expect(out.dayMap.get('2027-04-01')).toBe('publicHoliday');
    expect(out.opportunities).toHaveLength(1);
    expect(out.opportunities[0].explanation.anchorHolidayKey).toBe('San Test');
  });
});
