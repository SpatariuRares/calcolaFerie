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
