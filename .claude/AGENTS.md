# Orchestrator instructions

You are the orchestrator for the CalcolaFerie project.
Dispatch one subagent per issue using the agents view.
Respect the dependency waves — wait for each wave before starting the next.

## Dependency waves

| Wave | Issues (run in parallel within wave) |
|------|--------------------------------------|
| 1    | 01-project-setup                     |
| 2    | 02-engine-types, 05-input-form, 09-supabase-leads |
| 3    | 03-calculate-algorithm, 08-persistence |
| 4    | 04-engine-tests, 06-results-table    |
| 5    | 07-calendar-view                     |

Each subagent must:
- Complete ALL acceptance criteria in its assigned issue
- Commit changes with a clear message when done
- NOT touch files outside its issue scope

## Issues

---
### 01-project-setup.md

## What to build

Bootstrap the monorepo structure for CalcolaFerie. Two concerns must be separable from day one: the framework-agnostic engine and the Next.js app. Set up tooling so both can be developed and tested independently.

- Initialise Next.js (App Router) with TypeScript.
- Create `engine/` at the repo root with no Next.js imports. The app may import from `engine/`, never the reverse.
- Configure Vitest to run tests in `engine/` without a Next.js context.
- Add ESLint + Prettier with a rule that flags any `next` or `react` import inside `engine/`.
- Verify: `vitest run` passes on an empty test file; `next build` succeeds on a blank page.

## Acceptance criteria

- [ ] `engine/` directory exists at repo root with its own `tsconfig.json` (no Next.js lib).
- [ ] Vitest is configured and runs tests in `engine/` with `pnpm test`.
- [ ] `next dev` starts without errors on a blank `/` route.
- [ ] An ESLint rule (or path alias restriction) prevents `engine/` from importing Next.js or React.
- [ ] `README.md` documents the two-layer structure and how to run tests vs. the dev server.

## Blocked by

None — can start immediately.

---
### 02-engine-types-holidays.md

## What to build

Define the complete TypeScript domain model for the engine and provide the Italian public holiday dataset for a rolling 12-month window.

**Domain types** (in `engine/types.ts`):

```ts
// Decisions from session prototype — decision-rich subset, not runnable code

type ISODateString = string; // "YYYY-MM-DD"
type DayType = 'weekend' | 'publicHoliday' | 'companyClosure' | 'mandatoryLeave' | 'recommendedLeave' | 'workday';
type PublicHolidayKind = 'national' | 'easter' | 'pasquetta' | 'patron';
type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // matches Date.getDay()

interface WorkSchedule {
  workDays: Set<WeekdayIndex>; // default: all 7
  consumeHolidaysOnPublicHolidays: boolean; // default: false (CCNL standard)
}

interface DayOff {
  date: ISODateString;
  type: 'companyClosure' | 'mandatoryLeave';
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

- [ ] All types exported from `engine/types.ts` with no React/Next.js imports.
- [ ] `getItalianPublicHolidays(2026)` returns exactly the 11 fixed Italian national holidays with correct dates.
- [ ] `computeEaster(2025)` returns `"2025-04-20"`, `computeEaster(2026)` returns `"2026-04-05"`.
- [ ] `getPublicHolidaysForWindow` correctly spans Dec 2026 → Dec 2027 without duplicates.
- [ ] `calculatePlan` stub exported from `engine/index.ts`.
- [ ] `vitest run` passes on type-only smoke tests.

## Blocked by

#01 — project setup must exist first.

---
### 03-calculate-plan-algorithm.md

## What to build

Implement `calculatePlan(input: EngineInput): EngineOutput` — the core engine. Replace the stub from #02 with a working algorithm.

**Algorithm (high-level):**

1. Scan every day in `[windowStart, windowEnd]` and classify it into a `DayType`. Build the `dayMap`.
2. Identify contiguous "free blocks" — runs of days that are `weekend`, `publicHoliday`, or `companyClosure`.
3. For each free block, find the minimum-cost vacation days needed to close gaps immediately before/after the block (and any single-day internal gaps). Compute `leva = staccoDays / costDays`.
4. For pairs of nearby free blocks, also compute leva for the fused block (fill all gaps between them). Compare fused leva vs. individual levas. Keep whichever set is higher — no hard-coded distance threshold; the math decides.
5. Build `BridgeOpportunity` for each winning configuration, including `recommendedDays` (the specific vacation days to take) and `ExplanationData`.
6. Sort opportunities by `startDate` ascending.
7. Compute `availableBudget = totalVacationDays - count(daysOff where type === 'mandatoryLeave')`.
8. Return `{ opportunities, dayMap, availableBudget }`.

**Key invariants:**

- `publicHoliday` days never appear in `recommendedDays` (they are already free).
- `companyClosure` days never appear in `recommendedDays` (already free, no budget cost).
- `mandatoryLeave` days are pre-deducted from `availableBudget` but are NOT added to `recommendedDays` (user cannot choose them).
- Opportunities where `costDays > availableBudget` are still included in output — the UI applies the "fuori budget" marker.
- `WorkSchedule.consumeHolidaysOnPublicHolidays` — when `true`, a `publicHoliday` that falls within a recommended leave period costs a vacation day (add it to `costDays`).
- `staccoDays` counts calendar days (Mon–Sun), not only workdays.

## Acceptance criteria

- [ ] `calculatePlan` returns correct `opportunities` and `dayMap` for a minimal input (single national holiday on a Thursday → 1-day Friday bridge, leva 4.0, staccoDays 4).
- [ ] Easter + Pasquetta fuse into one opportunity by default (fused leva ≥ individual).
- [ ] Two holidays where split leva > fused leva → engine returns two separate opportunities.
- [ ] `availableBudget` equals `totalVacationDays` minus mandatory leave days count.
- [ ] `companyClosure` days do not appear in `recommendedDays` and do not affect `availableBudget`.
- [ ] An opportunity with `costDays` exceeding `availableBudget` is still present in output.
- [ ] All days in `dayMap` within the window have a `DayType` assigned.
- [ ] Days outside `[windowStart, windowEnd]` produce no opportunities.
- [ ] Patron saint date passed in `publicHolidays` is treated identically to a national holiday.

## Blocked by

#02 — types and holiday data must exist first.

---
### 04-engine-test-suite.md

## What to build

Write the full test suite for `calculatePlan`. Tests live in `engine/` and run with Vitest. Test only the public contract — `EngineInput` in, `EngineOutput` out. No mocking of internals.

**What makes a good test here:** construct a precise `EngineInput` with known holidays and known `daysOff`, call `calculatePlan`, assert specific fields on `EngineOutput`. Avoid snapshot tests — assert concrete values.

**Test cases (minimum):**

| # | Scenario | What to assert |
|---|----------|----------------|
| 1 | Single national holiday on Thursday (e.g. 25 aprile 2027 = Thursday) | 1 opportunity, `costDays: 1`, `staccoDays: 4`, `leva: 4`, `recommendedDays` = [the Friday] |
| 2 | Holiday on Monday | `recommendedDays` = [the Friday before], staccoDays 4, leva 4 |
| 3 | Holiday on Wednesday | `costDays: 2` (Tue+Thu or Mon+Fri options explored), assert whichever leva is higher |
| 4 | Easter + Pasquetta (Sun+Mon) | Single fused opportunity, `staccoDays ≥ 4`, `costDays: 0` (already free) |
| 5 | Two holidays 2 workdays apart, fused leva > split | Single fused opportunity returned |
| 6 | Two holidays far apart, split leva > fused | Two separate opportunities returned |
| 7 | `mandatoryLeave` days deducted from `availableBudget` | `availableBudget = totalVacationDays - mandatoryLeave.length` |
| 8 | `companyClosure` does NOT reduce `availableBudget` | `availableBudget` unchanged |
| 9 | `companyClosure` adjacent to a holiday extends the free block | Opportunity `staccoDays` includes closure day without adding to `costDays` |
| 10 | `costDays > availableBudget` | Opportunity still present in `opportunities` |
| 11 | `dayMap` for a known date | Correct `DayType` for holiday, weekend, workday, closure, mandatory |
| 12 | Date outside window | No opportunity with `startDate` before `windowStart` or after `windowEnd` |
| 13 | Patron saint date | Treated as `publicHoliday`, appears in `dayMap` as `'publicHoliday'` |
| 14 | `consumeHolidaysOnPublicHolidays: true` | Public holiday within recommended period increases `costDays` by 1 |

## Acceptance criteria

- [ ] All 14 test cases above pass.
- [ ] `vitest run` exits 0 with no skipped tests.
- [ ] No test imports any internal engine helper — only `calculatePlan` and public types.

## Blocked by

#03 — algorithm must be implemented first.

---
### 05-input-form-ui.md

## What to build

Build the input form for the tool page (`/`). The form collects the user's `UserConfig` and triggers `calculatePlan` when the user presses "Calcola". No reactive recalculation — calculation happens only on button press.

**Fields:**

1. **Budget ferie** — number input. Integer ≥ 0. Label: "Giorni di ferie disponibili".
2. **Chiusure e giorni obbligati** — repeatable date list. Each entry has a date picker and a toggle: `companyClosure` ("Chiusura aziendale — giorno gratuito") or `mandatoryLeave` ("Giorno obbligatorio — scala dal budget"). The UI must explain the distinction inline because many Italian employers call mandatory leave "chiusura".
3. **Patrono locale** — optional date picker. Label: "Festività del tuo patrono locale (opzionale)".
4. **Calcola** — primary CTA button. Disabled while required fields are empty.

**Behaviour:**

- On "Calcola" press: call `calculatePlan` with the form values + `getPublicHolidaysForWindow` + patron date if set.
- Pass results down to the results table and calendar (placeholders acceptable in this slice — just wire the data flow).
- Mobile-first layout. Form must be usable one-handed on a 390px screen.

## Acceptance criteria

- [ ] All four fields render and accept valid input on mobile (390px viewport).
- [ ] Toggle between `companyClosure` and `mandatoryLeave` per date entry works correctly.
- [ ] "Calcola" button is disabled when `totalVacationDays` is empty.
- [ ] Pressing "Calcola" calls `calculatePlan` with correct `EngineInput` (verified via console or a test spy).
- [ ] Patron saint date, when set, appears in `publicHolidays` passed to engine with `kind: 'patron'`.
- [ ] Form is accessible: labels associated with inputs, keyboard navigable.

## Blocked by

#01 — project setup. Can be built in parallel with #02–04.

---
### 06-results-table-ui.md

## What to build

Render the list of `BridgeOpportunity` items returned by `calculatePlan`. Sorted chronologically by `startDate` (engine guarantees this). Each row shows the opportunity's efficiency and assembles the Italian explanation from `ExplanationData`.

**Table columns:**

| Column | Source | Notes |
|--------|--------|-------|
| Date range | `startDate` – `endDate` | "14–17 ago" format |
| Giorni stacco | `staccoDays` | Plain number |
| Ferie da usare | `costDays` | Plain number |
| Leva | `leva` | Badge, e.g. "4.0×", colour-coded by tier |
| Perché conviene | `explanation` | Assembled phrase (see below) |
| Budget marker | `costDays > availableBudget` | "Fuori budget" chip if over |

**Explanation phrase assembly** (from `ExplanationData`):

- Single holiday: `"{anchorHolidayName} cade {weekdayName} → {costDays} {giorni} di ferie = {staccoDays} giorni di stacco"`
- Fused: `"{holiday1} + {holiday2} → {costDays} {giorni} di ferie = {staccoDays} giorni di stacco"`

Weekday names in Italian. `costDays === 0` case: "Nessuna feria necessaria — blocco già libero".

**Leva badge tiers** (indicative — adjust after seeing real data):

- `≥ 4.0` — green
- `2.5–3.9` — amber
- `< 2.5` — neutral/grey

**Layout:** single-column card list on mobile; table on ≥ 768px.

## Acceptance criteria

- [ ] All opportunities from engine output render in chronological order.
- [ ] "Fuori budget" chip appears on rows where `costDays > availableBudget`.
- [ ] Italian explanation phrase is correct for single-holiday, fused, and zero-cost cases.
- [ ] Leva badge colour matches tier correctly.
- [ ] Renders correctly at 390px (mobile) and 1024px (desktop).
- [ ] Empty state shown when `opportunities` is empty.

## Blocked by

#03 — algorithm, #05 — input form (data flow wired).

---
### 07-calendar-view-ui.md

## What to build

Render a 12-month rolling calendar (from today to today + 12 months) where every day is colour-coded by its `DayType` from `EngineOutput.dayMap`. The calendar gives users a full-year visual overview of their plan.

**Day colour mapping:**

| DayType | Colour (indicative) |
|---------|---------------------|
| `publicHoliday` | Red / festivo |
| `weekend` | Light grey |
| `companyClosure` | Blue |
| `mandatoryLeave` | Orange |
| `recommendedLeave` | Green |
| `workday` | White / default |

A day can only have one `DayType` — the engine's `dayMap` is the single source of truth.

**Layout:**

- One month per row/card, scrollable vertically.
- Month and year label above each grid.
- Colour legend fixed or pinned at top.
- Mobile-first: 7-column grid, days as small squares.
- Tapping a day (on mobile) or hovering (desktop) shows a tooltip: day type label + holiday name if applicable.

**Data source:** `EngineOutput.dayMap` passed from the parent page after "Calcola" is pressed. Calendar shows a skeleton/empty state before first calculation.

## Acceptance criteria

- [ ] 12 months render correctly starting from today's date.
- [ ] Each day square uses the correct colour for its `DayType`.
- [ ] `recommendedLeave` days (from winning `BridgeOpportunity.recommendedDays`) appear green.
- [ ] Legend is visible without scrolling on first load.
- [ ] Tooltip/popover on tap/hover shows day type and holiday name when `DayType === 'publicHoliday'`.
- [ ] Calendar renders correctly at 390px with no horizontal overflow.
- [ ] Empty/pre-calculation state is handled gracefully (no errors, placeholder shown).

## Blocked by

#06 — results table (data flow from engine to page must be established).

---
### 08-persistence-localstorage-url.md

## What to build

Persist `UserConfig` across sessions via `localStorage` and generate a shareable URL so users (and HR managers) can share a pre-filled plan.

**`UserConfig` shape** (serialisable subset of engine input):

```ts
interface UserConfig {
  totalVacationDays: number;
  daysOff: DayOff[];           // { date: ISODateString, type: 'companyClosure' | 'mandatoryLeave' }[]
  patronSaintDate?: ISODateString;
  workSchedule?: Partial<WorkSchedule>;
}
```

**localStorage:**

- Key: `calcolaferie_config`.
- Write on every "Calcola" press (not on every keystroke).
- Read on page load and pre-fill the form silently.
- No migration logic needed in V1 — if the stored value fails to parse, discard it and start fresh.

**Shareable URL:**

- Function `serializeConfig(config: UserConfig): URLSearchParams`.
- Function `deserializeConfig(params: URLSearchParams): UserConfig | null` (returns null on invalid params).
- URL params example: `?budget=20&daysOff=2026-08-14:closure,2026-12-24:mandatory&patron=2026-06-24`.
- "Copia link" button appears after "Calcola" is pressed. Copies `window.location.origin + '?' + serialized` to clipboard.
- On page load, if URL contains valid params, pre-fill form from URL (URL takes precedence over localStorage).

## Acceptance criteria

- [ ] After pressing "Calcola", config is saved to `localStorage['calcolaferie_config']`.
- [ ] Reloading the page restores the form with saved values.
- [ ] Corrupt/missing localStorage value is silently ignored — form starts empty.
- [ ] "Copia link" button appears post-calculation and copies a valid URL to clipboard.
- [ ] Opening the copied URL on a different browser pre-fills the form correctly.
- [ ] URL params take precedence over localStorage when both are present.
- [ ] `serializeConfig` and `deserializeConfig` are pure functions tested in `engine/` (or a `lib/` utility).

## Blocked by

#05 — input form must exist to pre-fill and to hook "Calcola" press.

---
### 09-supabase-leads.md

## What to build

Set up Supabase for email collection. Scope is strictly minimal: one table, one insert path, GDPR consent.

**Supabase setup:**

- Table `leads`: columns `id` (uuid, pk), `email` (text, unique), `created_at` (timestamptz, default now()).
- RLS enabled. Single policy: `INSERT` allowed for the `anon` role. No `SELECT`, `UPDATE`, or `DELETE` from anon.
- Anon key stored in `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var. URL in `NEXT_PUBLIC_SUPABASE_URL`.

**UI — email capture widget:**

- A small form below the results: email input + submit button.
- Checkbox: "Acconsento al trattamento dei miei dati per ricevere aggiornamenti su CalcolaFerie." Required before submit is enabled. (GDPR explicit consent.)
- On submit: `supabase.from('leads').insert({ email })`. On duplicate email: show "Sei già iscritto." On success: "Grazie! Ti terremo aggiornato."
- Widget is hidden until "Calcola" has been pressed at least once (show it only to users who have seen results).

**No auth, no storage, no other Supabase features in V1.**

## Acceptance criteria

- [ ] `leads` table exists with correct schema and RLS policy (insert only for anon).
- [ ] Email widget appears only after first "Calcola" press.
- [ ] Consent checkbox is required — submit button disabled without it.
- [ ] Successful insert shows success message without page reload.
- [ ] Duplicate email shows "Sei già iscritto." without an error crash.
- [ ] Anon key is never exposed in server-side logs (client-side insert only, key is `NEXT_PUBLIC_`).
- [ ] No Supabase calls are made from `engine/` — only from the Next.js app layer.

## Blocked by

#01 — project setup. Can be built in parallel with #02–08.

