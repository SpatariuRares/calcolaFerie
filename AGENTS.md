# CalcolaFerie — Agent Instructions

Italian vacation optimizer: given a user's leave budget and Italian public holidays, find "bridge" opportunities (ponti) that maximize days off per vacation day consumed.

## Commands

```bash
pnpm dev              # dev server → http://localhost:3000
pnpm build            # production build
pnpm test             # vitest (all test projects, one-shot)
pnpm test:watch       # vitest watch
pnpm test:e2e         # playwright E2E (auto-starts dev server)
pnpm test:smoke       # vitest + playwright golden-path smoke
pnpm test:coverage    # v8 coverage
pnpm lint             # eslint
pnpm format           # prettier --write
```

Run a single file: `pnpm test -- engine/tests/bridge.test.ts`
Run by project: `pnpm test -- --project engine` or `--project ui`

## Architecture

Two strict layers. **Never import `app/` inside `engine/`.**

### `engine/src/` — pure TypeScript, zero framework deps

| File | Role |
|------|------|
| `types.ts` | All domain types: `EngineInput`, `EngineOutput`, `BridgeOpportunity`, `UserConfig`, `DayType` |
| `holidays.ts` | Italian public holiday list; Easter computed via Anonymous Gregorian algorithm |
| `date.ts` | Date arithmetic utilities |
| `bridge.ts` | Bridge detection — finds gaps between a holiday/closure and a weekend, computes `leva` |
| `planner.ts` | Budget-aware opportunity ranking, `dayMap` construction |
| `index.ts` | Public entry: `calculatePlan(input: EngineInput): EngineOutput` |

Core formula: **`leva = staccoDays / costDays`** — total days in the extended break divided by vacation days spent.

Default `minBridgeLeverage = 2.1` (in `planner.ts`). Opportunities below this threshold are filtered. Override via `EngineInput.minBridgeLeverage`.

### `app/` — Next.js 16 + React 19

Routes: `app/page.tsx` (main planner), `app/privacy/page.tsx`

**`app/_lib/`** — glue between engine and UI:

| File | Role |
|------|------|
| `engine-input.ts` | Builds `EngineInput` from form state |
| `calculate-vacation-plan.ts` | Calls `calculatePlan`, wraps result in `CalculationState` |
| `calendar-model.ts` | Transforms `EngineOutput.dayMap` into month/week grid structures |
| `user-config-url.ts` | Serialize/deserialize `UserConfig` to localStorage + URL params |
| `affiliate-link.ts` | Builds Travelpayouts booking deep-links |
| `holiday-labels.ts` | Maps holiday keys to Italian display strings |

**`app/_components/`:**
- `vacation-planner.tsx` — single large client component; all form state lives here via `useState`/`useRef`. No external state library.
- `results-table.tsx` — renders ranked `BridgeOpportunity[]`, emits toggle events up.
- `newsletter-consent-text.tsx` — static GDPR consent copy.

**Styles:** SCSS modules in `app/styles/`; `app.module.scss` imports partials. CSS variables in `globals.css`.

## Tests

Vitest runs two projects (`vitest.config.ts`):
- `engine` (node env): `engine/tests/**/*.test.ts` + `tests/engine/**/*.spec.ts`
- `ui` (jsdom env): `tests/ui/**/*.spec.ts` + `app/**/*.test.ts`

**Gotcha:** `tests/ui/*.spec.ts` run under vitest/jsdom — NOT playwright. The `.spec.ts` extension is misleading.

Playwright: `tests/smoke/golden-path.spec.ts` only. Auto-starts `pnpm dev`; reuses existing server locally.

MSW mock server lives in `tests/mocks/` for UI tests that need API interception.

## Path Aliases

```
@         →  project root
@engine   →  engine/src/index.ts
```

## Persistence

- localStorage key: `calcolaferie_config` (written on "Calcola" press, read on page load)
- URL params: `?budget=20&daysOff=2026-08-14:closure&patron=2026-06-24` — URL takes precedence over localStorage
- `PlannerConfig` (in `user-config-url.ts`) extends `UserConfig` with `selectedVacationDates?: ISODateString[]`

## Environment

Create `.env.local` (gitignored):
```
NEXT_PUBLIC_TRAVELPAYOUTS_MARKER=your_marker_here
```
Without it, affiliate links are built but the marker param is empty. No other env vars required for local dev.
