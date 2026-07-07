## What to build

Add the first revenue stream to CalcolaFerie: contextual travel-affiliate
links attached to each bridge opportunity. The goal is monetisation that fits
the moment of intent — a user who just learned "25 aprile = giovedì → 4 giorni
liberi" is about to think about a trip on those exact dates.

This must not compromise the product's clean-UX, cookieless positioning. We do
**not** introduce Google Analytics, display ads, or a cookie banner. Any
tracking cookie set after the user clicks an affiliate link is set by the
affiliate provider on their domain, not by us.

Use **Travelpayouts** as the affiliate aggregator for V1 (single signup,
built-in deep-link tools, covers Booking.com and others). Do not integrate
multiple affiliate networks directly in V1.

**Decision context (resolved in grilling session):**

- Google Analytics → rejected. Brings cookies → GDPR banner → kills the
  no-banner positioning. Only an ad-based model needed it, and ads are dropped.
- Display ads + cookie banner → rejected short-term. Pennies on low traffic,
  taxes every other funnel (affiliate, newsletter, future SaaS leads).
- Revenue model → affiliate now, SaaS B2B later.
- Costs to cover early (~€0–20/mo) are covered by a single affiliate booking;
  no banner required.

**UI — per-bridge affiliate CTA:**

- Each bridge opportunity row gets a CTA, e.g. "Prenota questi giorni".
- The CTA links to a Travelpayouts deep-link with check-in / check-out
  pre-filled from the opportunity's `startDate` / `endDate`.
- V1 is **dates-only**: no destination is passed. The user lands on the
  provider's search with dates set and picks the city there.
- Do **not** add a "dove vai?" destination field in V1. Ship dates-only,
  measure click-through, and add destination input later only if CTR justifies
  the added friction.
- A short affiliate disclosure sits near the CTA, for example:
  "Link affiliato: se prenoti, riceviamo una commissione senza costi extra per
  te."
- The CTA must read as helpful, not spammy — one link per opportunity, no
  pop-ups, no interstitials.

**Deep-link builder:**

- A small pure helper builds the affiliate URL from an opportunity.
- Input: `{ startDate: string; endDate: string }` (ISO dates from
  `BridgeOpportunity`).
- Output: a full Travelpayouts deep-link string with the affiliate/marker ID
  and the date params set.
- The affiliate/marker ID comes from a `NEXT_PUBLIC_` env var (it is a public
  identifier, safe to expose client-side).
- The helper lives in the Next.js app layer, **not** in `engine/`. The engine
  stays free of monetisation concerns.

**Legal / privacy:**

- Add an affiliate-disclosure line near each CTA (see copy above).
- Add a short "Link di affiliazione" section to `app/privacy/page.tsx`
  explaining that booking links are affiliate links and that the provider may
  set its own cookies after a click.
- No cookie banner is added. We set no tracking cookies ourselves.

## Acceptance criteria

- [ ] Each bridge opportunity row renders a single affiliate CTA.
- [ ] The CTA URL is a Travelpayouts deep-link with check-in/check-out set from
      the opportunity's `startDate` / `endDate`.
- [ ] No destination field is added in V1 (dates-only deep-link).
- [ ] The deep-link builder is a pure helper in the app layer, unit-tested.
- [ ] The affiliate/marker ID is read from a `NEXT_PUBLIC_` env var.
- [ ] No affiliate, monetisation, or network code is added to `engine/`.
- [ ] An affiliate-disclosure line is visible near each CTA.
- [ ] `app/privacy/page.tsx` gains an affiliate-links section.
- [ ] No Google Analytics is added.
- [ ] No display-ad script is added.
- [ ] No cookie banner / consent-management script is added.
- [ ] We set no tracking cookies from our own domain.

## Out of scope for V1

- Destination ("dove vai?") input and city-aware deep-links.
- Curated/editorial destination suggestions per ponte.
- Multiple affiliate networks beyond Travelpayouts.
- Flight/train-specific affiliate widgets.
- Click/conversion analytics dashboards (cookieless analytics decision —
  Plausible vs Umami — tracked separately).
- SaaS B2B paid features.

## Blocked by

#01 — project setup.

#06 — results table UI must exist to host the per-bridge CTA.

## Notes

The privacy policy page (`app/privacy/page.tsx`, issue #11) already exists and
is ship-ready for the newsletter scope. It is **not** a hard blocker — but its
opening line ("riguarda solo la newsletter") must be broadened and a "Link di
affiliazione" section added as part of this issue before affiliate links go
live.
