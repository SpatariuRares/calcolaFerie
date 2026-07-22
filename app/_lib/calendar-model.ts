import {
  addDays,
  isoToDate,
  pad,
  toISO,
  type DayType,
  type EngineInput,
  type EngineOutput,
  type ISODateString,
} from "@engine";
import { holidayLabel } from "./holiday-labels";

export type CalendarDay = {
  iso: ISODateString;
  dayNumber: number;
  type: DayType;
  holidayName?: string;
  isPast?: boolean;
};

export type CalendarMonth = {
  key: string;
  label: string;
  leadingBlankDays: number;
  days: CalendarDay[];
};

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  weekend: "Weekend",
  publicHoliday: "Festivo",
  companyClosure: "Chiusura",
  mandatoryLeave: "Ferie obbligatorie",
  recommendedLeave: "Ferie consigliate",
  workday: "Lavorativo",
};

export const CALENDAR_LEGEND: DayType[] = [
  "recommendedLeave",
  "publicHoliday",
  "companyClosure",
  "mandatoryLeave",
  "weekend",
  "workday",
];

export type CalendarLocalization = {
  locale?: string;
  dayTypeLabels?: Record<DayType, string>;
  holidayLabel?: (key: string) => string;
};

function localeTag(locale = "it") {
  return locale === "en" ? "en-GB" : "it-IT";
}

function getMondayFirstBlankDays(date: Date) {
  return (date.getUTCDay() + 6) % 7;
}

function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function getCalendarDayLabel(
  day: CalendarDay,
  { locale = "it", dayTypeLabels = DAY_TYPE_LABELS }: CalendarLocalization = {}
) {
  const formatter = new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return [formatter.format(isoToDate(day.iso)), dayTypeLabels[day.type], day.holidayName]
    .filter(Boolean)
    .join(" — ");
}

export function isSelectableVacationDay(type: DayType) {
  return type === "workday" || type === "recommendedLeave";
}

/**
 * Ordered list of every day the user can pick as vacation, used to group a
 * selection into contiguous runs (weekends/holidays between two picked days
 * don't split the run, since they are absent from this sequence).
 */
export function buildSelectableVacationDates(
  input: EngineInput,
  output: EngineOutput
): ISODateString[] {
  return buildCalendarMonths(input, output).flatMap((month) =>
    month.days.filter((day) => isSelectableVacationDay(day.type)).map((day) => day.iso)
  );
}

export function buildCalendarMonths(
  input: EngineInput,
  output: EngineOutput,
  { locale = "it", holidayLabel: localizeHoliday = holidayLabel }: CalendarLocalization = {}
): CalendarMonth[] {
  const monthFormatter = new Intl.DateTimeFormat(localeTag(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const holidayNames = new Map(
    input.publicHolidays.map((holiday) => [holiday.date, localizeHoliday(holiday.key)])
  );
  const months: CalendarMonth[] = [];

  let current: CalendarMonth | null = null;
  let currentKey = "";

  const gridStart = toISO(isoToDate(input.windowStart).getUTCFullYear(), 1, 1);
  const windowEndDate = isoToDate(input.windowEnd);
  const lastDayOfEndMonth = new Date(
    Date.UTC(windowEndDate.getUTCFullYear(), windowEndDate.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const gridEnd = toISO(
    windowEndDate.getUTCFullYear(),
    windowEndDate.getUTCMonth() + 1,
    lastDayOfEndMonth
  );

  for (let iso = gridStart; iso <= gridEnd; iso = addDays(iso, 1)) {
    const date = isoToDate(iso);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const key = `${year}-${pad(month + 1)}`;

    if (key !== currentKey) {
      const firstOfMonth = isoToDate(toISO(year, month + 1, 1));
      current = {
        key,
        label: monthFormatter.format(firstOfMonth),
        leadingBlankDays: getMondayFirstBlankDays(firstOfMonth),
        days: [],
      };
      months.push(current);
      currentKey = key;
    }

    const isPast = iso < input.windowStart;
    const type = output.dayMap.get(iso) ?? (isWeekend(date) ? "weekend" : "workday");
    current!.days.push({
      iso,
      dayNumber: date.getUTCDate(),
      type,
      holidayName: holidayNames.get(iso),
      ...(isPast ? { isPast: true } : {}),
    });
  }

  return months;
}
