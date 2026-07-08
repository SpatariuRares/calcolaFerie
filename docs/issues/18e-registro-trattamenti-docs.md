# Docs: registro trattamenti e TODO manuale compliance

## Parent

PRD #18 — `docs/issues/18-compliance-italia.md`

## What to build

Due documenti di accountability, nessun codice:

1. **Registro dei trattamenti** (art. 30 GDPR) in `docs/`: una tabella per
   trattamento — newsletter (provider email), statistiche di visita (analytics
   hosting), affiliazione — ognuno con finalità, base giuridica, categorie di
   dati, destinatari, trasferimenti extra-SEE, conservazione. Formato minimale:
   markdown, mezz'ora di lettura per il Garante.
2. **TODO manuale** `docs/issues/18-compliance-TODO-manuale.md`, stesso formato
   di `12-affiliate-TODO-manuale.md`, con i passi che restano al gestore:
   - creazione casella `privacy@calcolaferie.it`;
   - account Buttondown: verifica che i nuovi iscritti risultino non attivati
     finché non confermano e che il provider conservi i timestamp di conferma;
   - verifica certificazione Data Privacy Framework di Vercel e Buttondown su
     dataprivacyframework.gov e archiviazione dei DPA;
   - commercialista: decisione occasionale/abituale, eventuale apertura P.IVA
     e impostazione della variabile d'ambiente del footer (18c).

Registrare il TODO manuale in `docs/issues.json` con label `manual`, come già
fatto per l'affiliazione.

## Acceptance criteria

- [x] Registro trattamenti in `docs/` copre newsletter, analytics e affiliazione con finalità, base giuridica, dati, destinatari, trasferimenti e conservazione.
- [x] `docs/issues/18-compliance-TODO-manuale.md` esiste con i quattro blocchi di passi manuali.
- [x] Entry in `docs/issues.json` con label `manual` per il TODO manuale.

## Blocked by

None - can start immediately
