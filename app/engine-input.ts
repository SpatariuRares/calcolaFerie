import {
  getPublicHolidaysForWindow,
  type DayOff,
  type EngineInput,
  type ISODateString,
  type PublicHoliday,
  type UserConfig,
  type WeekdayIndex,
  type WorkSchedule,
} from "@/engine/src/index";

const DEFAULT_WORK_DAYS = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function dateToISO(date: Date): ISODateString {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addTwelveMonths(isoDate: ISODateString): ISODateString {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() + 12);
  return dateToISO(date);
}

export function getDefaultWorkSchedule(overrides?: Partial<WorkSchedule>): WorkSchedule {
  return {
    workDays: new Set(overrides?.workDays ?? DEFAULT_WORK_DAYS),
    consumeHolidaysOnPublicHolidays: overrides?.consumeHolidaysOnPublicHolidays ?? false,
  };
}

export function buildPublicHolidays(
  windowStart: ISODateString,
  windowEnd: ISODateString,
  patronSaintDate?: ISODateString
): PublicHoliday[] {
  const holidays = getPublicHolidaysForWindow(windowStart, windowEnd);

  if (patronSaintDate && patronSaintDate >= windowStart && patronSaintDate <= windowEnd) {
    holidays.push({
      date: patronSaintDate,
      name: "Patrono locale",
      kind: "patron",
    });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

export function buildEngineInput(config: UserConfig, today = new Date()): EngineInput {
  const windowStart = dateToISO(today);
  const windowEnd = addTwelveMonths(windowStart);
  const daysOff: DayOff[] = config.daysOff.filter((dayOff) => dayOff.date !== "");

  return {
    windowStart,
    windowEnd,
    workSchedule: getDefaultWorkSchedule(config.workSchedule),
    publicHolidays: buildPublicHolidays(windowStart, windowEnd, config.patronSaintDate),
    daysOff,
    totalVacationDays: config.totalVacationDays,
  };
}
