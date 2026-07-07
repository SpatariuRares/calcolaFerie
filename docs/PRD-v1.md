# PRD — CalcolaFerie v1 (Vacation Optimizer Engine + UI)

## Problem Statement

Italian workers receive a fixed number of vacation days per year and must decide *when* to use them. Maximizing total days off requires knowing which public holidays fall on which weekdays, which company closures are nearby, and how to "bridge" working days between holidays and weekends. This calculation is tedious to do manually, and existing tools (holiday calendars, generic planners) are passive — they display information but give no recommendation. The user must still do the math.

---

## Solution

A web tool that accepts the user's vacation budget, company closures, mandatory leave days, and local patron saint date, then returns a ranked list of **bridge opportunities** — contiguous blocks of days off where spending a few vacation days yields the maximum number of total days away from work. Each opportunity explains *why* it is efficient in plain language. The tool also renders a calendar view that colours every day of the next 12 months by type, so the user can see the full picture at a glance.

---

## User Stories

1. As a worker, I want to enter my annual vacation budget so that the tool knows how many days I have to allocate.
2. As a worker, I want to enter my company closure dates so that those free days are factored into my plan without consuming my budget.
3. As a worker, I want to enter mandatory leave days imposed by my employer so that the tool deducts them from my available budget before optimising.
4. As a worker, I want to enter my local patron saint holiday date so that the tool includes it as a public holiday.
5. As a worker, I want to see a list of bridge opportunities sorted chronologically so that I can plan the year in order.
6. As a worker, I want each bridge opportunity to show how many vacation days it costs and how many total days off I get so that I can compare options at a glance.
7. As a worker, I want each bridge opportunity to show a "leva" ratio (days off ÷ days spent) so that I can instantly see the efficiency of each option.
8. As a worker, I want a plain-language explanation for each bridge (e.g. "25 aprile falls on Thursday → 1 vacation day = 4 days off") so that I understand why the tool recommends it.
9. As a worker, I want bridge opportunities that exceed my remaining budget to still appear in the list (clearly marked) so that I know what I could gain by negotiating an extra day.
10. As a worker, I want a calendar view that colour-codes every day (public holiday, weekend, company closure, mandatory leave, recommended leave, regular workday) so that I can see my plan visually.
11. As a worker, I want my configuration to be saved in my browser so that I don't have to re-enter it on my next visit.
12. As a worker, I want to share my plan via a URL so that I can send it to colleagues or HR.
13. As a worker, I want the tool to cover the next 12 months rolling so that I can plan regardless of what month I open it.
14. As a worker, I want to press a single "Calculate" button to trigger the plan so that intermediate edits don't cause confusing partial results.
15. As a worker with an unusual schedule (shift worker, 6-day week), I want the tool's work-schedule assumptions to be extensible so that future versions can support my case without redesigning the engine.
16. As an HR manager, I want to share a pre-filled URL with my team so that everyone uses the same company closure dates without manual entry.
17. As an interested user, I want to subscribe to product updates after seeing my results so that I can be notified when the next holiday calendar is ready.

---

## Implementation Decisions

### Project stack

- **Framework:** Next.js (App Router). SSR/SSG by default — no SPA SEO gap. Chosen over Astro/TanStack because the long-term trajectory is a SaaS employee toolbox and Next.js is the right home for that future; also already known → ships faster.
- **Language:** TypeScript throughout.
- **Newsletter:** Buttondown — email signup after calculation, double opt-in, unsubscribe handled by the provider. No custom leads database in V1.
- **SEO content:** static MDX pages pre-rendered at build time. Target: keyword pages like "ponti 2027 italia". These are separate from the interactive tool.
- **Analytics:** Plausible or Umami (cookieless). Consistent with the clean-UX positioning — no cookie banner.
- **UI:** mobile-first. The tool is the primary surface; SEO pages are secondary.

### Project structure

The engine lives in `engine/` at the repo root, with no Next.js imports. The Next.js app imports from `engine/` but not vice versa. This keeps the engine portable and independently testable.

### Engine is pure TypeScript, framework-agnostic

The optimisation engine is a pure function `calculatePlan(input: EngineInput): EngineOutput`. It has no dependency on Next.js, React, or any runtime. It can be tested in isolation with plain Node.js.

### WorkSchedule is an injected dependency

The engine receives a `WorkSchedule` object rather than hard-coding Monday–Sunday assumptions. Default: all seven days are workdays. This makes the engine extensible for future shift-worker or 6-day-week scenarios without touching the core algorithm.

```ts
interface WorkSchedule {
  workDays: Set<0 | 1 | 2 | 3 | 4 | 5 | 6>; // 0 = Sunday
  consumeHolidaysOnPublicHolidays: boolean;   // default false (CCNL standard)
}
```

### staccoDays counts calendar days, not workdays

A "bridge" is valued by total days away from the desk, including weekends. `leva = staccoDays / costDays` where both are calendar counts. This matches user perception and produces the most legible rationale strings.

### Public holidays do not consume vacation days by default

`consumeHolidaysOnPublicHolidays: false` is the default, matching standard Italian employment contracts (CCNL). The flag exists in `WorkSchedule` for edge cases.

### CompanyClosure vs MandatoryLeave are semantically distinct

Both are modelled as `DayOff` with a `type` discriminant:

- `companyClosure` — employer-provided free day, does not consume budget.
- `mandatoryLeave` — employer-imposed leave, *does* consume budget. The engine subtracts these before computing `availableBudget`.

The FE must explain this distinction clearly because many Italian companies label mandatory leave as "chiusura aziendale".

### BridgeOpportunity is the atomic output unit

Each opportunity represents a contiguous block of days off (holidays + weekends + closures) plus the vacation days needed to fill internal gaps and extend the edges. The engine returns one optimal configuration per block (maximum leva). The user manually decides to extend.

### Block fusion: compute both, return best leva

When two holiday blocks are close together, the engine computes leva for the fused block and for each block separately, then returns whichever yields the higher leva. No hard-coded distance threshold — the optimal configuration emerges from the calculation.

### Explanation is structured data, not a string

```ts
interface ExplanationData {
  anchorHolidayName: string;
  anchorWeekday: WeekdayIndex;
  costDays: number;
  staccoDays: number;
  fusedHolidayNames?: string[];
}
```

The FE assembles the Italian phrase from these fields. The engine stays language-agnostic and portable.

### Patron saint date is manual input

V1: the user enters the date via a date picker. No commune lookup dataset is needed. V2 may add a comune search backed by a public ISTAT dataset.

### Engine returns all opportunities; UI handles budget filtering

`EngineOutput.opportunities` contains every bridge regardless of cost. Each carries `costDays` so the UI can compare against `availableBudget` and apply a "fuori budget" badge. This keeps the engine unaware of presentation concerns.

### Engine also returns a full DayMap

`EngineOutput.dayMap: Map<ISODateString, DayType>` is a by-product of the engine's day-by-day scan. Returning it avoids the FE reimplementing the same classification logic to drive the calendar view.

`DayType = 'weekend' | 'publicHoliday' | 'companyClosure' | 'mandatoryLeave' | 'recommendedLeave' | 'workday'`

### 12-month rolling window; no year selector

`windowStart = today`, `windowEnd = today + 12 months`. Computed at call time. Covers the real planning use case (December → next year) without a year-picker control.

### Persistence: localStorage + shareable URL

`UserConfig` (budget, daysOff, patronSaintDate, workSchedule overrides) is serialised to `URLSearchParams` for sharing and persisted to `localStorage` for return visits. The engine itself is stateless.

### Calculation is explicit (button press)

The user fills all fields, then presses "Calcola". No reactive recalculation. This makes the cause-and-effect legible and avoids debounce complexity in V1.

### Newsletter signup validates interest

After the user presses "Calcola" and sees results, the UI may show a small email
signup for product updates and the yearly reminder when the new holiday calendar
is ready. The signup goes through a Next.js server route, which validates email
and explicit consent before calling Buttondown with a server-only API key.

Buttondown owns double opt-in, subscriber storage, unsubscribe links, and manual
campaign sending. V1 does not add Supabase, a custom `leads` table, automations,
CRM, segmentation, or a custom unsubscribe flow.

---

## Testing Decisions

**What makes a good test:** test the engine's output contract (`BridgeOpportunity[]` and `DayMap`) for a given `EngineInput`. Do not test internal helper functions or intermediate data structures.

**Primary seam:** `calculatePlan(input) → output`. One pure function, one seam. All meaningful tests go here.

**Test cases to cover:**

- Single fixed national holiday on a Thursday → confirms a 1-day Friday bridge with leva 4.0
- Easter + Pasquetta (Monday) → confirms they fuse into a single block by default
- Two nearby holidays where fused leva < split leva → confirms engine returns split
- Two nearby holidays where fused leva > split leva → confirms engine returns fused
- MandatoryLeave days are deducted from `availableBudget`
- CompanyClosure days are not deducted from `availableBudget`
- Opportunities with `costDays > availableBudget` still appear in output
- `dayMap` correctly classifies every day type for a known input
- `windowStart` / `windowEnd` boundary: opportunities outside window do not appear
- Patron saint date treated as publicHoliday of kind 'patron'
- `consumeHolidaysOnPublicHolidays: true` — holiday within a leave period costs a vacation day

**No prior art** — greenfield project. Tests live in `engine/` alongside the types and algorithm.

---

## Out of Scope

- User authentication or accounts
- Saving multiple plans per user
- Budget-aware global optimiser (allocate all N days for best overall plan) — V2
- Reactive recalculation (button press only in V1)
- Commune lookup for patron saint (manual date in V1)
- Multi-language support (Italian only in V1)
- B2B white-label or agency features
- Affiliate travel links (SEO content pages, not the tool itself)
- Analytics integration (decided separately — Plausible/Umami preferred for cookie-banner-free UX)
- Ads

---

## Further Notes

- **SEO pages are separate from the tool.** Static MDX content targets keywords like "ponti 2027 italia"; the tool itself is a client-side interactive component and does not need to rank.
- **Newsletter scope:** Buttondown signup only after calculation. Double opt-in and unsubscribe are handled by Buttondown; the app only validates and forwards confirmed consent.
- **GDPR:** explicit consent is required before sending any email to Buttondown, and the signup must link to a minimal privacy policy.
- **Peak traffic window:** November–January (annual planning season). Launch must precede November to capture organic traffic.
- **Validation gate:** keyword research, competitor analysis, and at least one user confirmation of need before any production code is written (per project brief).
