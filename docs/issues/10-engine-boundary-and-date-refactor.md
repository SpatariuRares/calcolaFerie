## What to build

Architectural hardening of the `engine`/`app` seam and the date handling. The
layering is already sound (pure `engine` core, `app` adapter → use-case →
presenter → UI). This issue removes two real debts: the **inconsistent import seam**
into `engine/` and the **mixed UTC/local date handling** that risks off-by-one-day
bugs near DST. Pure refactors — no change to user-visible behaviour.

> **Decision:** `engine/` stays plain source (no `package.json`, not a workspace
> package). The seam is enforced by a single import alias + barrel discipline, not by
> package `exports`.

### Problems being fixed

1. **Inconsistent import seam.** App reaches into internals via `@/engine/src/index`
   (deep path), coupling it to engine's file layout. Fix: one alias `@engine` → the
   barrel `engine/src/index.ts`, used everywhere; no deep `src/*` imports.
2. **Triple alias mismatch.** `tsconfig.json` defines `@engine/*` (unused), app uses
   `@/engine/src/*`, `vitest.config.ts` defines `@engine → ./engine/src`.
3. **Engine excluded from root type-check.** `tsconfig.json` has `exclude: ["engine"]`
   but the app imports from it. No `project references` → type drift goes undetected.
4. **UTC vs local date handling mixed.** `engine` is UTC-correct (`getUTCDay`,
   `isoToUTC`); `engine-input.ts` and `calendar-model.ts` use local time
   (`new Date(year, month, day)`, `getDay`). Same domain, two conversion rules.
5. **`index.ts` is barrel + 250-line algorithm.** Entry point should export, not
   implement. `bestInterval` / `isValidBridgeInterval` / agglomerative merge are not
   exported → only tested black-box via `calculatePlan`.
6. **i18n leak into core.** Engine returns Italian strings (`"Chiusura aziendale"`,
   holiday names). Domain should be locale-neutral; UI translates.
7. **`ISODateString = string`** has no smart constructor — malformed strings reach
   the engine unchecked.

### Plan (ordered: high-value/low-risk → complex)

Each step is one commit with `pnpm test` green before the next. Steps 1–5 are pure
refactors (zero behaviour change); 6–7 touch the public type surface, done last
behind the now-granular tests.

1. **Single canonical date module** `engine/src/date.ts` — `pad`, `isoToDate`,
   `dateToISO`, `addDays`, all **UTC**. Replace the duplicated helpers in `index.ts`,
   `holidays.ts`, `engine-input.ts`, `calendar-model.ts`. Closes #4 and the date
   duplication together.
2. **Single engine alias** — `@engine` → `engine/src/index.ts` (the barrel) in
   `tsconfig.json` + `vitest.config.ts`. Drop the unused `@engine/*` mapping, the
   `@/engine/src/*` deep imports, and vitest's third mapping. Import-only change.
3. **Split `index.ts`** into barrel-only + `planner.ts` (`calculatePlan`) +
   `bridge.ts` (`bestInterval`, `isValidBridgeInterval`, validators). Export the
   helpers. Code move only, tests unchanged.
4. **Targeted unit tests on `bridge.ts`** — cover `isValidBridgeInterval` branches
   directly instead of through the 428-line black-box suite.
5. **`project references`** — root references `engine`; verify `next build` + `vitest`
   green. End-to-end type-check, no drift.
6. **Locale-neutral core + branded `ISODateString`** — engine returns keys
   (`anchorHolidayKey`), UI dictionary translates; `ISODateString = string & { __iso: true }`
   with a validating constructor at the `buildEngineInput` boundary.

## Acceptance criteria

- [ ] One date module; no `pad`/ISO↔Date conversion duplicated across files.
- [ ] All date math in `app` and `engine` is UTC — no `getDay`/`new Date(y,m,d)` local calls.
- [ ] No deep `@/engine/src/*` imports remain; app imports the engine only via `@engine`.
- [ ] Single engine alias `@engine` → `engine/src/index.ts`, shared by `tsconfig.json`
      and `vitest.config.ts`; the unused `@engine/*` mapping is removed.
- [ ] `index.ts` is a barrel only; `calculatePlan` lives in `planner.ts`, bridge helpers
      in `bridge.ts` and are exported.
- [ ] `bridge.ts` has direct unit tests for the validation branches.
- [ ] `tsconfig.json` uses `project references`; `engine` is no longer in `exclude`.
- [ ] Engine output carries locale-neutral keys; Italian strings live only in the UI layer.
- [ ] `ISODateString` is branded; malformed dates are rejected at the input boundary.
- [ ] `pnpm test` and `pnpm build` stay green after every step.

## Blocked by

Nothing. Best done before #08 (persistence) and #09 (leads), since both serialise
`UserConfig`/dates and will benefit from the branded type and the canonical date module.
