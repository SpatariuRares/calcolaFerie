## What to build

Define the complete TypeScript domain model for the engine and provide the Italian public holiday dataset for a rolling 12-month window.

**Domain types** (in `engine/types.ts`):

```ts
// Decisions from session prototype — decision-rich subset, not runnable code

type ISODateString = string; // "YYYY-MM-DD"
type DayType =
  | "weekend"
  | "publicHoliday"
  | "companyClosure"
  | "mandatoryLeave"
  | "recommendedLeave"
  | "workday";
type PublicHolidayKind = "national" | "easter" | "pasquetta" | "patron";
type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // matches Date.getDay()

interface WorkSchedule {
  workDays: Set<WeekdayIndex>; // default: all 7
  consumeHolidaysOnPublicHolidays: boolean; // default: false (CCNL standard)
}

interface DayOff {
  date: ISODateString;
  type: "companyClosure" | "mandatoryLeave";
}

interface EngineInput {
  windowStart: ISODateString;
  windowEnd: ISODateString;
  workSchedule: WorkSchedule;
  publicHolidays: PublicHoliday[];
  daysOff: DayOff[];
  totalVacationDays: number;
}

interface ExplanationData {
  anchorHolidayName: string;
  anchorWeekday: WeekdayIndex;
  costDays: number;
  staccoDays: number;
  fusedHolidayNames?: string[];
}

interface BridgeOpportunity {
  id: string;
  startDate: ISODateString;
  endDate: ISODateString;
  staccoDays: number;
  costDays: number;
  leva: number; // staccoDays / costDays
  recommendedDays: ISODateString[];
  explanation: ExplanationData;
}

interface EngineOutput {
  opportunities: BridgeOpportunity[]; // sorted by startDate asc
  dayMap: Map<ISODateString, DayType>;
  availableBudget: number; // totalVacationDays - mandatoryLeave count
}

interface UserConfig {
  totalVacationDays: number;
  daysOff: DayOff[];
  patronSaintDate?: ISODateString;
  workSchedule?: Partial<WorkSchedule>;
}
```

**Holiday data** (in `engine/holidays.ts`):

- Function `getItalianPublicHolidays(year: number): PublicHoliday[]` returning all fixed national holidays for the given year.
- Function `computeEaster(year: number): ISODateString` implementing the Anonymous Gregorian algorithm (computus). Pasquetta = Easter + 1 day.
- `getPublicHolidaysForWindow(windowStart, windowEnd): PublicHoliday[]` that spans across year boundaries correctly.
- Patron saint is NOT included here — it is user-supplied via `UserConfig.patronSaintDate`.

**Stub** (in `engine/index.ts`):

Export a `calculatePlan(input: EngineInput): EngineOutput` stub that throws `'not implemented'`. This is the seam all future slices and tests will use.

## Acceptance criteria

- [x] All types exported from `engine/types.ts` with no React/Next.js imports.
- [x] `getItalianPublicHolidays(2026)` returns exactly the 11 fixed Italian national holidays with correct dates.
- [x] `computeEaster(2025)` returns `"2025-04-20"`, `computeEaster(2026)` returns `"2026-04-05"`.
- [x] `getPublicHolidaysForWindow` correctly spans Dec 2026 → Dec 2027 without duplicates.
- [x] `calculatePlan` stub exported from `engine/index.ts`.
- [x] `vitest run` passes on type-only smoke tests.

## Blocked by

#01 — project setup must exist first.
