# Privacy policy: recapito, trasferimenti, localStorage

## Parent

PRD #18 — `docs/issues/18-compliance-italia.md`

## What to build

Completare l'informativa privacy sui tre punti richiesti dall'art. 13 GDPR e
dalla verifica di compliance:

1. **Recapito del titolare**: `privacy@calcolaferie.it` nelle sezioni
   "Titolare e contatto" e "Richieste privacy". Il profilo GitHub resta come
   canale aggiuntivo. (La creazione della casella è un passo manuale del
   gestore, tracciato in 18e.)
2. **Trasferimenti extra-SEE**: adottare la formula "EU–US Data Privacy
   Framework (o Standard Contractual Clauses come garanzia alternativa)" al
   posto del testo generico attuale.
3. **localStorage esplicito**: nominare la chiave `calcolaferie_config`,
   elencare cosa contiene (budget ferie, date di chiusura, patrono) e chiarire
   che è memorizzazione tecnica richiesta dall'utente, esente da consenso ex
   art. 5(3) direttiva ePrivacy.

## Acceptance criteria

- [x] L'email `privacy@calcolaferie.it` compare nelle sezioni Titolare/contatto e Richieste privacy.
- [x] La sezione trasferimenti usa la formula DPF/SCC.
- [x] La chiave `calcolaferie_config`, il contenuto e l'esenzione da consenso sono citati.
- [x] Test jsdom sulla pagina privacy asseriscono la presenza dei tre testi.
- [x] `pnpm test` e `pnpm lint` passano.

## Blocked by

None - can start immediately
