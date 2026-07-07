import { describe, it, expect } from 'vitest';
import {
  computeEaster,
  getItalianPublicHolidays,
  getPublicHolidaysForWindow,
  calculatePlan,
} from '@engine';
import type {
  ISODateString,
  DayType,
  PublicHolidayKind,
  WeekdayIndex,
  PublicHoliday,
  WorkSchedule,
  DayOff,
  EngineInput,
  ExplanationData,
  BridgeOpportunity,
  EngineOutput,
  UserConfig,
} from '@engine';

// AC1: all types exported from engine with no React/Next.js imports
describe('engine types', () => {
  it('exports ISODateString compatible type', () => {
    const d: ISODateString = '2026-01-01';
    expect(d).toBe('2026-01-01');
  });

  it('exports all required type shapes', () => {
    const kind: PublicHolidayKind = 'national';
    const dayType: DayType = 'workday';
    const weekday: WeekdayIndex = 4;
    expect(kind).toBe('national');
    expect(dayType).toBe('workday');
    expect(weekday).toBe(4);
  });

  it('EngineInput interface is structurally complete', () => {
    const schedule: WorkSchedule = {
      workDays: new Set<WeekdayIndex>([1, 2, 3, 4, 5]),
      consumeHolidaysOnPublicHolidays: false,
    };
    const dayOff: DayOff = { date: '2026-03-01', type: 'mandatoryLeave' };
    const holiday: PublicHoliday = { date: '2026-04-25', key: 'liberation', kind: 'national' };
    const input: EngineInput = {
      windowStart: '2026-01-01',
      windowEnd: '2026-12-31',
      workSchedule: schedule,
      publicHolidays: [holiday],
      daysOff: [dayOff],
      totalVacationDays: 20,
    };
    expect(input.totalVacationDays).toBe(20);
  });

  it('BridgeOpportunity and EngineOutput shapes compile', () => {
    const exp: ExplanationData = {
      anchorKind: 'publicHoliday',
      anchorHolidayKey: 'liberation',
      anchorWeekday: 5,
      costDays: 1,
      staccoDays: 4,
    };
    const opp: BridgeOpportunity = {
      id: 'test',
      startDate: '2026-04-25',
      endDate: '2026-04-26',
      staccoDays: 4,
      costDays: 1,
      leva: 4,
      recommendedDays: ['2026-04-24'],
      explanation: exp,
    };
    const output: EngineOutput = {
      opportunities: [opp],
      dayMap: new Map(),
      availableBudget: 19,
    };
    expect(output.availableBudget).toBe(19);
  });

  it('UserConfig interface is structurally complete', () => {
    const config: UserConfig = {
      totalVacationDays: 20,
      daysOff: [],
      patronSaintDate: '2026-06-24',
    };
    expect(config.patronSaintDate).toBe('2026-06-24');
  });
});

// AC2: getItalianPublicHolidays(2026) returns exactly 11 national holidays
describe('getItalianPublicHolidays', () => {
  it('returns 11 holidays for 2026', () => {
    expect(getItalianPublicHolidays(2026)).toHaveLength(11);
  });

  it('includes all 10 fixed national holidays for 2026', () => {
    const dates = getItalianPublicHolidays(2026)
      .filter((h) => h.kind === 'national')
      .map((h) => h.date);
    expect(dates).toHaveLength(10);
    for (const d of [
      '2026-01-01', '2026-01-06', '2026-04-25', '2026-05-01',
      '2026-06-02', '2026-08-15', '2026-11-01', '2026-12-08',
      '2026-12-25', '2026-12-26',
    ]) {
      expect(dates).toContain(d);
    }
  });

  it('includes Pasquetta on 2026-04-06', () => {
    const pasquetta = getItalianPublicHolidays(2026).find((h) => h.kind === 'pasquetta');
    expect(pasquetta?.date).toBe('2026-04-06');
  });
});

// AC3: computeEaster correctness
describe('computeEaster', () => {
  it('2025 → 2025-04-20', () => {
    expect(computeEaster(2025)).toBe('2025-04-20');
  });
  it('2026 → 2026-04-05', () => {
    expect(computeEaster(2026)).toBe('2026-04-05');
  });
});

// AC4: getPublicHolidaysForWindow spans year boundaries without duplicates
describe('getPublicHolidaysForWindow', () => {
  it('spans Dec 2026 → Dec 2027 without duplicates', () => {
    const holidays = getPublicHolidaysForWindow('2026-12-01', '2027-12-31');
    const dates = holidays.map((h) => h.date);
    expect(dates.length).toBe(new Set(dates).size);
  });

  it('includes holidays from both years', () => {
    const holidays = getPublicHolidaysForWindow('2026-12-01', '2027-01-31');
    const dates = holidays.map((h) => h.date);
    expect(dates).toContain('2026-12-25');
    expect(dates).toContain('2026-12-26');
    expect(dates).toContain('2027-01-01');
    expect(dates).toContain('2027-01-06');
  });

  it('excludes dates outside the window', () => {
    const holidays = getPublicHolidaysForWindow('2026-12-01', '2026-12-31');
    for (const h of holidays) {
      expect(h.date >= '2026-12-01').toBe(true);
      expect(h.date <= '2026-12-31').toBe(true);
    }
  });
});

// AC5: calculatePlan exported and callable
describe('calculatePlan', () => {
  it('is exported from engine and callable', () => {
    expect(typeof calculatePlan).toBe('function');
  });

  it('returns EngineOutput shape', () => {
    const out = calculatePlan({
      windowStart: '2027-04-01',
      windowEnd: '2027-04-07',
      workSchedule: { workDays: new Set<WeekdayIndex>([1, 2, 3, 4, 5]), consumeHolidaysOnPublicHolidays: false },
      publicHolidays: [{ date: '2027-04-01', key: 'Test', kind: 'national' }],
      daysOff: [],
      totalVacationDays: 20,
    });
    expect(Array.isArray(out.opportunities)).toBe(true);
    expect(out.dayMap instanceof Map).toBe(true);
    expect(typeof out.availableBudget).toBe('number');
  });
});
