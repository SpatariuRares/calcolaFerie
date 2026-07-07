## What to build

Add a minimal privacy policy for CalcolaFerie before publishing the newsletter
signup. The policy only needs to cover the data collected in V1: the user's email
address for product updates and yearly reminders about the updated holiday
calendar.

The policy should be plain, short, and linked from the newsletter consent
checkbox. It should make clear that Buttondown is used as the newsletter
provider and that users can unsubscribe from any email.

**Page/content:**

- Add a privacy policy page in the app, for example `/privacy`.
- Explain what data is collected: email address, signup timestamp/provider
  metadata, and any technical data Buttondown normally records for newsletter
  operation.
- Explain why it is collected: sending CalcolaFerie updates and a manual yearly
  reminder when the new calendar/holiday data is ready.
- Explain the legal basis in simple terms: explicit consent via the signup form.
- Explain that Buttondown is the email/newsletter provider.
- Explain how to unsubscribe: use the unsubscribe link in any email.
- Provide a contact method for privacy/data requests.

**Scope:**

- No cookie banner in this issue unless analytics/tracking cookies are added
  elsewhere.
- No legal boilerplate generator output unless it is reviewed and simplified for
  this product.
- No custom data export/deletion UI in V1.

## Acceptance criteria

- [ ] A privacy policy page exists and is reachable in the app.
- [ ] Newsletter consent text links to the privacy policy.
- [ ] Policy names the collected data and the purpose of collection.
- [ ] Policy states that signup is based on explicit consent.
- [ ] Policy names Buttondown as the newsletter provider.
- [ ] Policy explains unsubscribe through email unsubscribe links.
- [ ] Policy includes a contact method for privacy requests.
- [ ] No newsletter signup form is published without this page linked.

## Blocked by

#01 — project setup.
