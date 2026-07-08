# Footer: identità del gestore e slot P.IVA

## Parent

PRD #18 — `docs/issues/18-compliance-italia.md`

## What to build

Il footer del planner (oggi solo link Privacy) espone le informazioni richieste
dal D.lgs 70/2003 per i servizi della società dell'informazione:

- nome del gestore (Spatariu Rares);
- email di contatto (`privacy@calcolaferie.it`);
- P.IVA, solo quando disponibile: il valore arriva da una variabile d'ambiente
  pubblica (deve comparire nel bundle, non è un segreto); se la variabile è
  assente la riga non viene renderizzata. Lo slot serve ad adempiere
  all'obbligo di esposizione (art. 35 DPR 633/72) senza un nuovo sviluppo
  quando il commercialista avrà deciso la posizione fiscale.

Nessun nuovo componente: si estende il footer esistente. Il link Privacy resta.

## Acceptance criteria

- [ ] Il footer mostra nome del gestore ed email di contatto.
- [ ] Senza variabile P.IVA impostata la riga P.IVA non è renderizzata (test).
- [ ] Con variabile P.IVA impostata la riga compare con il valore (test).
- [ ] Il link Privacy esistente resta funzionante.
- [ ] `pnpm test` e `pnpm lint` passano.

## Blocked by

None - can start immediately
