import {
  addDays,
  isoToDate,
  pad,
  toISO,
  type DayType,
  type EngineInput,
  type EngineOutput,
} from "@/engine/src/index";

export type CalendarDay = {
  iso: string;
  dayNumber: number;
  type: DayType;
  holidayName?: string;
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

export function getCalendarDayLabel(day: CalendarDay) {
  return [DAY_FORMATTER.format(isoToDate(day.iso)), DAY_TYPE_LABELS[day.type], day.holidayName]
    .filter(Boolean)
    .join(" — ");
}

export function isSelectableVacationDay(type: DayType) {
  return type === "workday" || type === "recommendedLeave";
}

export function buildCalendarMonths(input: EngineInput, output: EngineOutput): CalendarMonth[] {
  const holidayNames = new Map(input.publicHolidays.map((holiday) => [holiday.date, holiday.name]));
  const months: CalendarMonth[] = [];

  let current: CalendarMonth | null = null;
  let currentKey = "";
  let firstDayOfWindow = true;

  for (let iso = input.windowStart; iso <= input.windowEnd; iso = addDays(iso, 1)) {
    const date = isoToDate(iso);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const key = `${year}-${pad(month + 1)}`;

    if (key !== currentKey) {
      const firstOfMonth = isoToDate(toISO(year, month + 1, 1));
      current = {
        key,
        label: MONTH_FORMATTER.format(firstOfMonth),
        // First window month is anchored on windowStart so the grid lines up with
        // the partial month; later months start on their 1st.
        leadingBlankDays: getMondayFirstBlankDays(firstDayOfWindow ? date : firstOfMonth),
        days: [],
      };
      months.push(current);
      currentKey = key;
      firstDayOfWindow = false;
    }

    const type = output.dayMap.get(iso);
    if (type) {
      current!.days.push({
        iso,
        dayNumber: date.getUTCDate(),
        type,
        holidayName: holidayNames.get(iso),
      });
    }
  }

  return months;
}
