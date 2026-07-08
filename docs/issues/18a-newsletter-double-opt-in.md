# Newsletter: double opt-in forzato dalla route

## Parent

PRD #18 — `docs/issues/18-compliance-italia.md`

## What to build

La route di iscrizione newsletter deve garantire il double opt-in a livello di
codice, indipendentemente dalle impostazioni dell'account del provider. La
richiesta di creazione subscriber verso Buttondown include il campo che marca
l'iscritto come non attivato (`type: "unactivated"` nell'API v1 subscribers —
verificare il nome esatto del campo nella versione corrente dell'API prima di
fissare il payload): il provider invia l'email di conferma e l'utente non
riceve nulla finché non conferma.

Il contratto della route verso il client non cambia: stessi status code, stessi
messaggi di successo/errore. Il messaggio di successo esistente ("Controlla la
tua email per confermare l'iscrizione") corrisponde già al comportamento
double opt-in.

Aggiornare il testo dell'informativa privacy dove descrive la newsletter, così
che citi la conferma via email come parte del flusso di iscrizione.

## Acceptance criteria

- [x] Il payload verso il provider contiene il campo double opt-in oltre a `email_address`.
- [x] Test intercetta la richiesta in uscita e asserisce il payload (`type: "unactivated"` in `tests/api/09-newsletter-api.spec.ts`).
- [x] I casi esistenti (consenso mancante, email invalida, duplicato, API key assente) restano verdi senza modifiche.
- [x] L'informativa privacy cita la conferma via email nel flusso di iscrizione.
- [x] Nessuna modifica in `engine/`; `pnpm test` e `pnpm lint` passano.

## Blocked by

None - can start immediately
