export type ISODateString = string;
export type DayType =
  | 'weekend'
  | 'publicHoliday'
  | 'companyClosure'
  | 'mandatoryLeave'
  | 'recommendedLeave'
  | 'workday';
export type PublicHolidayKind = 'national' | 'easter' | 'pasquetta' | 'patron';
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PublicHoliday {
  date: ISODateString;
  /** Locale-neutral identifier; the UI maps it to a display label. */
  key: string;
  kind: PublicHolidayKind;
}

export type AnchorKind = 'publicHoliday' | 'companyClosure';

export interface WorkSchedule {
  workDays: Set<WeekdayIndex>;
  consumeHolidaysOnPublicHolidays: boolean;
}

export interface DayOff {
  date: ISODateString;
  type: 'companyClosure' | 'mandatoryLeave';
}

export interface EngineInput {
  windowStart: ISODateString;
  windowEnd: ISODateString;
  workSchedule: WorkSchedule;
  publicHolidays: PublicHoliday[];
  daysOff: DayOff[];
  totalVacationDays: number;
  minBridgeLeverage?: number;
}

export interface ExplanationData {
  anchorKind: AnchorKind;
  /** Holiday key of the anchor; absent when the anchor is a company closure. */
  anchorHolidayKey?: string;
  anchorWeekday: WeekdayIndex;
  costDays: number;
  staccoDays: number;
  fusedHolidayKeys?: string[];
}

export interface BridgeOpportunity {
  id: string;
  startDate: ISODateString;
  endDate: ISODateString;
  staccoDays: number;
  costDays: number;
  leva: number;
  recommendedDays: ISODateString[];
  explanation: ExplanationData;
}

export interface EngineOutput {
  opportunities: BridgeOpportunity[];
  dayMap: Map<ISODateString, DayType>;
  availableBudget: number;
}

export interface UserConfig {
  totalVacationDays: number;
  daysOff: DayOff[];
  patronSaintDate?: ISODateString;
  minBridgeLeverage?: number;
  workSchedule?: Partial<WorkSchedule>;
}
