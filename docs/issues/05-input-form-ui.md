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
