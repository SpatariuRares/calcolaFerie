## What to build

Make `ISODateString` a branded type with a single validating constructor at the
input boundary, so a malformed date string can't reach the engine. Split out of #10
(step 7) because branding ripples through every date value and the `<input type="date">`
boundary — too invasive to ride along with the rest of that refactor.

### Design

```ts
// engine/src/types.ts
export type ISODateString = string & { readonly __iso: unique symbol };
```

```ts
// engine/src/date.ts — the only place a raw string becomes an ISODateString
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isoDate(value: string): ISODateString {
  if (!ISO_RE.test(value) || Number.isNaN(Date.parse(value + "T00:00:00Z"))) {
    throw new RangeError(`Invalid ISO date: ${JSON.stringify(value)}`);
  }
  return value as ISODateString;
}

export function tryIsoDate(value: string): ISODateString | null {
  try {
    return isoDate(value);
  } catch {
    return null;
  }
}
```

- The existing UTC helpers (`toISO`, `addDays`, `addMonths`, `localToday`, `dateToISO`)
  already produce well-formed strings — have them return `ISODateString` directly
  (they're the trusted producers, no re-validation needed).
- `buildEngineInput` is the untrusted boundary: every date arriving from the form
  (`daysOff[].date`, `patronSaintDate`) and from URL/localStorage deserialization
  (#08) must pass through `isoDate` / `tryIsoDate`. Reject (or drop) invalid rows
  there rather than deep in the engine.
- `<input type="date">` values are plain `string`; validate on read, brand on entry.

### Acceptance criteria

- [x] `ISODateString` is branded; a plain `string` is not assignable without going
      through `isoDate` / `tryIsoDate`.
- [x] `isoDate` rejects malformed input (`""`, `"2026-13-40"`, `"not-a-date"`); the
      trusted UTC producers return `ISODateString` without re-validation.
- [x] `buildEngineInput` validates every externally-sourced date and never forwards an
      invalid one to `calculatePlan`.
- [x] Unit tests cover valid pass-through, each rejection case, and the boundary
      filtering in `buildEngineInput`.
- [x] `pnpm test` and `pnpm build` stay green.

## Blocked by

#10 — builds on the canonical date module and locale-neutral engine landed there.
Coordinate with #08 (persistence): deserialised dates are the main untrusted source
the brand is meant to catch.
