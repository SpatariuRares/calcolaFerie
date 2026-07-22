import {
  getPublicHolidaysForWindow,
  isoToDate,
  localToday,
  toISO,
  tryIsoDate,
  type DayOff,
  type EngineInput,
  type ISODateString,
  type PublicHoliday,
  type UserConfig,
  type WeekdayIndex,
  type WorkSchedule,
} from "@engine";

const DEFAULT_WORK_DAYS = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

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
      key: "patron",
      kind: "patron",
    });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

export function buildEngineInput(config: UserConfig, today = new Date()): EngineInput {
  const windowStart = localToday(today);
  // La finestra copre l'anno corrente più gennaio dell'anno prossimo (fino al 31/01),
  // così i ponti mostrati non sconfinano oltre gennaio dell'anno successivo.
  const windowEnd = toISO(isoToDate(windowStart).getUTCFullYear() + 1, 1, 31);
  const daysOff: DayOff[] = config.daysOff.flatMap((dayOff) => {
    const date = tryIsoDate(dayOff.date);
    return date ? [{ date, type: dayOff.type }] : [];
  });
  const patronSaintDate = config.patronSaintDate ? tryIsoDate(config.patronSaintDate) : null;

  return {
    windowStart,
    windowEnd,
    workSchedule: getDefaultWorkSchedule(config.workSchedule),
    publicHolidays: buildPublicHolidays(windowStart, windowEnd, patronSaintDate ?? undefined),
    daysOff,
    totalVacationDays: config.totalVacationDays,
    minBridgeLeverage: config.minBridgeLeverage,
  };
}
