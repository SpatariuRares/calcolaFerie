import type { DayType, EngineInput, EngineOutput } from "@/engine/src/index";

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
});

const DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function parseISODate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`);
}

function dateToISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayFirstBlankDays(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function getCalendarDayLabel(day: CalendarDay) {
  return [DAY_FORMATTER.format(parseISODate(day.iso)), DAY_TYPE_LABELS[day.type], day.holidayName]
    .filter(Boolean)
    .join(" — ");
}

export function buildCalendarMonths(input: EngineInput, output: EngineOutput): CalendarMonth[] {
  const startDate = parseISODate(input.windowStart);
  const endDate = parseISODate(input.windowEnd);
  const holidayNames = new Map(input.publicHolidays.map((holiday) => [holiday.date, holiday.name]));
  const months: CalendarMonth[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (cursor <= endDate) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const iso = dateToISO(date);
      const type = output.dayMap.get(iso);

      if (!type || iso < input.windowStart || iso > input.windowEnd) continue;

      days.push({
        iso,
        dayNumber: day,
        type,
        holidayName: holidayNames.get(iso),
      });
    }

    months.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: MONTH_FORMATTER.format(firstDay),
      leadingBlankDays:
        year === startDate.getFullYear() && month === startDate.getMonth()
          ? getMondayFirstBlankDays(startDate)
          : getMondayFirstBlankDays(firstDay),
      days,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}
