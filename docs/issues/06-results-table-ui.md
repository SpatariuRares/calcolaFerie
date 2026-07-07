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
