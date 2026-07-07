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

- [x] `calculatePlan` returns correct `opportunities` and `dayMap` for a minimal input (single national holiday on a Thursday → 1-day Friday bridge, leva 4.0, staccoDays 4).
- [x] Easter + Pasquetta fuse into one opportunity by default (fused leva ≥ individual).
- [x] Two holidays where split leva > fused leva → engine returns two separate opportunities.
- [x] `availableBudget` equals `totalVacationDays` minus mandatory leave days count.
- [x] `companyClosure` days do not appear in `recommendedDays` and do not affect `availableBudget`.
- [x] An opportunity with `costDays` exceeding `availableBudget` is still present in output.
- [x] All days in `dayMap` within the window have a `DayType` assigned.
- [x] Days outside `[windowStart, windowEnd]` produce no opportunities.
- [x] Patron saint date passed in `publicHolidays` is treated identically to a national holiday.

## Blocked by

#02 — types and holiday data must exist first.
