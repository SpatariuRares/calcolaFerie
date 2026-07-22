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

const MONTH_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function getMondayFirstBlankDays(date: Date) {
  return (date.getUTCDay() + 6) % 7;
}

function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function getCalendarDayLabel(day: CalendarDay) {
  return [DAY_FORMATTER.format(isoToDate(day.iso)), DAY_TYPE_LABELS[day.type], day.holidayName]
    .filter(Boolean)
    .join(" — ");
}

export function isSelectableVacationDay(type: DayType) {
  return type === "workday" || type === "recommendedLeave";
}

export function buildCalendarMonths(input: EngineInput, output: EngineOutput): CalendarMonth[] {
  const holidayNames = new Map(
    input.publicHolidays.map((holiday) => [holiday.date, holidayLabel(holiday.key)])
  );
  const months: CalendarMonth[] = [];

  let current: CalendarMonth | null = null;
  let currentKey = "";

  // Render from 1 January of windowStart's year through the last day of the month
  // that contains windowEnd — so the grid spans the whole planning window (l'anno
  // corrente più i mesi extra fino a windowEnd, es. gennaio dell'anno prossimo).
  // Days before windowStart are rendered as past; whole months are always shown.
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
        label: MONTH_FORMATTER.format(firstOfMonth),
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
