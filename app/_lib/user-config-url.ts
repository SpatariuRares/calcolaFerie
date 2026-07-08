import { isValidISODateString } from "@engine";
import type { DayOff, ISODateString, UserConfig, WeekdayIndex, WorkSchedule } from "@engine";

export const CONFIG_STORAGE_KEY = "calcolaferie_config";

export interface PlannerConfig extends UserConfig {
  selectedVacationDates?: ISODateString[];
}

const DAY_OFF_TYPE_TO_PARAM = {
  companyClosure: "closure",
  mandatoryLeave: "mandatory",
} as const satisfies Record<DayOff["type"], string>;

const PARAM_TO_DAY_OFF_TYPE = {
  closure: "companyClosure",
  mandatory: "mandatoryLeave",
} as const satisfies Record<string, DayOff["type"]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBudget(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 ? value : null;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseDayOff(value: unknown): DayOff | null {
  if (!isRecord(value)) return null;
  if (!isValidISODateString(value.date)) return null;
  if (value.type !== "companyClosure" && value.type !== "mandatoryLeave") return null;

  return {
    date: value.date,
    type: value.type,
  };
}

function parseDayOffs(value: unknown): DayOff[] | null {
  if (!Array.isArray(value)) return null;

  const dayOffs: DayOff[] = [];
  for (const item of value) {
    const dayOff = parseDayOff(item);
    if (!dayOff) return null;
    dayOffs.push(dayOff);
  }

  return dayOffs;
}

function parseISODateList(value: unknown): ISODateString[] | null {
  if (!Array.isArray(value)) return null;

  const dates = new Set<ISODateString>();
  for (const date of value) {
    if (!isValidISODateString(date) || dates.has(date)) return null;
    dates.add(date);
  }

  return [...dates].sort((a, b) => a.localeCompare(b));
}

function parseDayOffTypeParam(value: string | undefined): DayOff["type"] | null {
  if (value === "closure") return PARAM_TO_DAY_OFF_TYPE.closure;
  if (value === "mandatory") return PARAM_TO_DAY_OFF_TYPE.mandatory;
  return null;
}

function parseWorkDays(value: unknown): Set<WeekdayIndex> | null {
  if (value instanceof Set) {
    value = [...value];
  }

  if (!Array.isArray(value)) return null;

  const workDays = new Set<WeekdayIndex>();
  for (const day of value) {
    if (
      typeof day !== "number" ||
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6 ||
      workDays.has(day as WeekdayIndex)
    ) {
      return null;
    }

    workDays.add(day as WeekdayIndex);
  }

  return workDays;
}

function normalizeWorkSchedule(value: unknown): Partial<WorkSchedule> | undefined | null {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;

  const schedule: Partial<WorkSchedule> = {};

  if (value.workDays !== undefined) {
    const workDays = parseWorkDays(value.workDays);
    if (!workDays) return null;
    schedule.workDays = workDays;
  }

  if (value.consumeHolidaysOnPublicHolidays !== undefined) {
    if (typeof value.consumeHolidaysOnPublicHolidays !== "boolean") return null;
    schedule.consumeHolidaysOnPublicHolidays = value.consumeHolidaysOnPublicHolidays;
  }

  return schedule;
}

function normalizeUserConfig(value: unknown): PlannerConfig | null {
  if (!isRecord(value)) return null;

  const totalVacationDays = parseBudget(value.totalVacationDays);
  if (totalVacationDays === null) return null;

  const daysOff = parseDayOffs(value.daysOff);
  if (!daysOff) return null;

  const workSchedule = normalizeWorkSchedule(value.workSchedule);
  if (workSchedule === null) return null;

  const selectedVacationDates =
    value.selectedVacationDates === undefined
      ? undefined
      : parseISODateList(value.selectedVacationDates);
  if (selectedVacationDates === null) return null;

  if (value.patronSaintDate !== undefined && !isValidISODateString(value.patronSaintDate)) {
    return null;
  }

  return {
    totalVacationDays,
    daysOff,
    ...(value.patronSaintDate ? { patronSaintDate: value.patronSaintDate } : {}),
    ...(workSchedule ? { workSchedule } : {}),
    ...(selectedVacationDates && selectedVacationDates.length > 0 ? { selectedVacationDates } : {}),
  };
}

function parseDayOffsParam(value: string | null): DayOff[] | null {
  if (value === null) return [];
  if (value === "") return null;

  const dayOffs: DayOff[] = [];
  for (const item of value.split(",")) {
    const [date, paramType, extra] = item.split(":");
    if (extra !== undefined) return null;
    if (!isValidISODateString(date)) return null;

    const type = parseDayOffTypeParam(paramType);
    if (!type) return null;

    dayOffs.push({ date, type });
  }

  return dayOffs;
}

function parseWorkDaysParam(value: string | null): Set<WeekdayIndex> | null | undefined {
  if (value === null) return undefined;
  if (value === "") return null;

  const workDays = new Set<WeekdayIndex>();
  for (const day of value.split(",")) {
    const parsed = Number(day);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) return null;
    if (workDays.has(parsed as WeekdayIndex)) return null;
    workDays.add(parsed as WeekdayIndex);
  }

  return workDays;
}

function parseConsumeHolidaysParam(value: string | null): boolean | null | undefined {
  if (value === null) return undefined;
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

function parseVacationDatesParam(value: string | null): ISODateString[] | null | undefined {
  if (value === null) return undefined;
  if (value === "") return null;

  const dates = new Set<ISODateString>();
  for (const date of value.split(",")) {
    if (!isValidISODateString(date) || dates.has(date)) return null;
    dates.add(date);
  }

  return [...dates].sort((a, b) => a.localeCompare(b));
}

function workDaysToArray(workDays: WorkSchedule["workDays"] | undefined): WeekdayIndex[] {
  return workDays ? [...workDays].sort((a, b) => a - b) : [];
}

export function serializeConfig(config: PlannerConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set("budget", String(config.totalVacationDays));

  if (config.daysOff.length > 0) {
    params.set(
      "daysOff",
      config.daysOff
        .map((dayOff) => `${dayOff.date}:${DAY_OFF_TYPE_TO_PARAM[dayOff.type]}`)
        .join(",")
    );
  }

  if (config.patronSaintDate) {
    params.set("patron", config.patronSaintDate);
  }

  const workDays = workDaysToArray(config.workSchedule?.workDays);
  if (workDays.length > 0) {
    params.set("workDays", workDays.join(","));
  }

  if (config.workSchedule?.consumeHolidaysOnPublicHolidays !== undefined) {
    params.set("consumeHolidays", config.workSchedule.consumeHolidaysOnPublicHolidays ? "1" : "0");
  }

  if (config.selectedVacationDates && config.selectedVacationDates.length > 0) {
    params.set(
      "vacation",
      [...config.selectedVacationDates].sort((a, b) => a.localeCompare(b)).join(",")
    );
  }

  return params;
}

export function deserializeConfig(params: URLSearchParams): PlannerConfig | null {
  const budget = parseBudget(params.get("budget"));
  if (budget === null) return null;

  const daysOff = parseDayOffsParam(params.get("daysOff"));
  if (!daysOff) return null;

  const patronSaintDate = params.get("patron");
  if (patronSaintDate !== null && !isValidISODateString(patronSaintDate)) return null;

  const workDays = parseWorkDaysParam(params.get("workDays"));
  if (workDays === null) return null;

  const consumeHolidaysOnPublicHolidays = parseConsumeHolidaysParam(params.get("consumeHolidays"));
  if (consumeHolidaysOnPublicHolidays === null) return null;

  const selectedVacationDates = parseVacationDatesParam(params.get("vacation"));
  if (selectedVacationDates === null) return null;

  const workSchedule: Partial<WorkSchedule> = {};
  if (workDays !== undefined) workSchedule.workDays = workDays;
  if (consumeHolidaysOnPublicHolidays !== undefined) {
    workSchedule.consumeHolidaysOnPublicHolidays = consumeHolidaysOnPublicHolidays;
  }

  return {
    totalVacationDays: budget,
    daysOff,
    ...(patronSaintDate ? { patronSaintDate } : {}),
    ...(Object.keys(workSchedule).length > 0 ? { workSchedule } : {}),
    ...(selectedVacationDates && selectedVacationDates.length > 0 ? { selectedVacationDates } : {}),
  };
}

export function deserializeStoredConfig(value: string | null): PlannerConfig | null {
  if (!value) return null;

  try {
    return normalizeUserConfig(JSON.parse(value));
  } catch {
    return null;
  }
}

export function getInitialUserConfig(
  params: URLSearchParams,
  storedValue: string | null
): PlannerConfig | null {
  return deserializeConfig(params) ?? deserializeStoredConfig(storedValue);
}
