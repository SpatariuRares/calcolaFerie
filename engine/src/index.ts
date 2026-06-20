export type {
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
} from './types.js';
export { computeEaster, getItalianPublicHolidays, getPublicHolidaysForWindow } from './holidays.js';

import type { EngineInput, EngineOutput } from './types.js';

export function calculatePlan(_input: EngineInput): EngineOutput {
  throw new Error('not implemented');
}
