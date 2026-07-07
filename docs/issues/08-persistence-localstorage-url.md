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
