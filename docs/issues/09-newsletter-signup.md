## What to build

Set up a minimal newsletter signup for users who have already seen a useful
result. The goal is validation: collect confirmed interest and send occasional
manual product updates, especially a yearly reminder when the new holiday
calendar is ready.

Use Buttondown as the newsletter provider. Do not introduce Supabase for V1.
Buttondown owns the subscriber list, double opt-in flow, unsubscribe handling,
and campaign sending.

**UI — newsletter signup widget:**

- A small form below the results: email input + submit button.
- The widget is hidden until "Calcola" has been pressed at least once.
- Copy should be specific to the use case, for example:
  "Vuoi ricevere il calendario ferie aggiornato a inizio anno?"
- Checkbox: "Acconsento al trattamento dei miei dati per ricevere aggiornamenti
  su CalcolaFerie." Required before submit is enabled.
- Include a link to the privacy policy near the consent text.
- On submit, call an app route; do not call Buttondown directly from the browser.
- On success, show: "Controlla la tua email per confermare l'iscrizione."
- On duplicate/already subscribed, show a non-crashing friendly message.

**Server route:**

- Route: `POST /api/newsletter-signup`.
- Input: `{ email: string, consent: boolean }`.
- Validate email shape server-side.
- Reject requests where `consent !== true`.
- Call Buttondown using a server-only API key, not a `NEXT_PUBLIC_` variable.
- Request/enable Buttondown double opt-in for the signup.
- Return stable response codes/messages the UI can present without exposing
  provider internals.

**Email strategy for V1:**

- Manual newsletter/campaign only.
- Primary planned campaign: an email at the beginning of the year when the new
  calendar/holiday data is ready.
- No automations, CRM, segmentation, or custom subscriber database in V1.

## Acceptance criteria

- [ ] Email widget appears only after first "Calcola" press.
- [ ] Consent checkbox is required; submit button is disabled without it.
- [ ] Privacy policy is linked from the consent area.
- [ ] Submit calls `POST /api/newsletter-signup` without a page reload.
- [ ] Server route validates email and consent before contacting Buttondown.
- [ ] Buttondown API key is server-only and never exposed via `NEXT_PUBLIC_`.
- [ ] Buttondown signup uses double opt-in.
- [ ] Successful request shows "Controlla la tua email per confermare l'iscrizione."
- [ ] Duplicate/already subscribed responses do not crash the UI.
- [ ] Unsubscribe is handled by Buttondown links, not custom app logic.
- [ ] No newsletter/provider calls are made from `engine/` — only from the Next.js app layer.
- [ ] No Supabase dependency, table, RLS policy, or client insert path is added for V1.

## Blocked by

#01 — project setup.

#11 — privacy policy must exist before the signup form goes live.
