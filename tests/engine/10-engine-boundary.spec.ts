import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  bestInterval,
  getItalianPublicHolidays,
  isFree,
  isScheduledWorkday,
  isValidISODateString,
  isValidBridgeInterval,
  isWeekdayAnchor,
  type Day,
  type DayType,
  type WeekdayIndex,
} from "@engine";

const ROOT = process.cwd();
const APP_ROOT = join(ROOT, "app");
const ENGINE_ROOT = join(ROOT, "engine", "src");
const PRODUCTION_ROOTS = [APP_ROOT, ENGINE_ROOT];
const DATE_MODULE = join(ENGINE_ROOT, "date.ts");
const WORK_DAYS = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) return sourceFiles(path);
    if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) return [path];
    return [];
  });
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function days(...spec: [DayType, WeekdayIndex][]): Day[] {
  return spec.map(([type, weekday], index) => ({
    iso: `2027-04-${String(index + 1).padStart(2, "0")}`,
    weekday,
    type,
  }));
}

describe("engine boundary and date refactor", () => {
  it("uses @engine as the only public app import seam", () => {
    const appSources = sourceFiles(APP_ROOT);

    for (const file of appSources) {
      expect(read(file), relative(ROOT, file)).not.toMatch(/@\/engine\/src|@engine\//);
    }
  });

  it("shares a single @engine alias that points at the barrel", () => {
    const tsconfig = JSON.parse(read(join(ROOT, "tsconfig.json")));
    const vitestConfig = read(join(ROOT, "vitest.config.ts"));

    expect(tsconfig.compilerOptions.paths).toMatchObject({
      "@engine": ["./engine/src/index.ts"],
    });
    expect(tsconfig.compilerOptions.paths["@engine/*"]).toBeUndefined();
    expect(vitestConfig).toContain('new URL("./engine/src/index.ts", import.meta.url)');
    expect(read(join(ROOT, "tsconfig.json"))).not.toMatch(/"engine"/);
  });

  it("keeps index.ts as a barrel and calculatePlan in planner.ts", () => {
    const indexSource = read(join(ENGINE_ROOT, "index.ts"));
    const plannerSource = read(join(ENGINE_ROOT, "planner.ts"));

    expect(indexSource).not.toMatch(/function\s+calculatePlan|const\s+calculatePlan/);
    expect(indexSource).toContain('export { calculatePlan } from "./planner"');
    expect(indexSource).toContain('} from "./bridge"');
    expect(plannerSource).toMatch(/export function calculatePlan/);
    expect(bestInterval).toBeTypeOf("function");
    expect(isFree).toBeTypeOf("function");
    expect(isScheduledWorkday).toBeTypeOf("function");
    expect(isValidBridgeInterval).toBeTypeOf("function");
    expect(isWeekdayAnchor).toBeTypeOf("function");
  });

  it("centralizes date formatting, parsing, and validation in engine/src/date.ts", () => {
    const dateSource = read(DATE_MODULE);
    expect(dateSource).toMatch(/export function pad/);
    expect(dateSource).toMatch(/export function isoToDate/);
    expect(dateSource).toMatch(/export function dateToISO/);
    expect(dateSource).toMatch(/export function isValidISODateString/);

    const offenders = PRODUCTION_ROOTS.flatMap(sourceFiles)
      .filter((file) => file !== DATE_MODULE)
      .filter((file) => /padStart|T00:00:00Z/.test(read(file)))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it("validates ISO dates through the canonical date module", () => {
    expect(isValidISODateString("2026-02-28")).toBe(true);
    expect(isValidISODateString("")).toBe(false);
    expect(isValidISODateString("2026-13-40")).toBe(false);
    expect(isValidISODateString("not-a-date")).toBe(false);
  });

  it("uses UTC date math in app and engine production code", () => {
    const offenders = PRODUCTION_ROOTS.flatMap(sourceFiles)
      .filter((file) => !file.endsWith("date.ts"))
      .filter((file) => /\.getDay\(\)|new Date\([^)]*,[^)]*,/.test(read(file)))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it("keeps built-in holiday identifiers locale-neutral", () => {
    expect(getItalianPublicHolidays(2026).map((holiday) => holiday.key)).toEqual([
      "newYear",
      "epiphany",
      "easterMonday",
      "liberation",
      "labourDay",
      "republic",
      "assumption",
      "allSaints",
      "immaculateConception",
      "christmas",
      "stStephen",
    ]);
  });
});

describe("bridge interval validation branches", () => {
  it("rejects a left workday run glued to the anchor", () => {
    const intervalDays = days(["workday", 1], ["publicHoliday", 2]);

    expect(isValidBridgeInterval(intervalDays, WORK_DAYS, 0, 1, 1, 1)).toBe(false);
  });

  it("accepts a left workday run separated from the anchor by a rest day", () => {
    const intervalDays = days(["workday", 1], ["weekend", 6], ["publicHoliday", 1]);

    expect(isValidBridgeInterval(intervalDays, WORK_DAYS, 0, 2, 2, 2)).toBe(true);
  });

  it("rejects a workday extension past the right cover edge", () => {
    const intervalDays = days(["publicHoliday", 1], ["workday", 2]);

    expect(isValidBridgeInterval(intervalDays, WORK_DAYS, 0, 1, 0, 0)).toBe(false);
  });
});
