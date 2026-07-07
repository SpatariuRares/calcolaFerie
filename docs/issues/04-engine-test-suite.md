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
