# Risultati: disclaimer ed etichetta affiliato per CTA

## Parent

PRD #18 — `docs/issues/18-compliance-italia.md`

## What to build

Due interventi di trasparenza nella zona risultati:

1. **Disclaimer risultati indicativi.** Una riga visibile insieme ai risultati
   (dopo il primo calcolo) che avvisa: i risultati sono indicativi; festività
   patronali e regole del proprio contratto/datore di lavoro vanno verificate.
   Posizionata accanto alla disclosure affiliazione già presente sotto la
   tabella.
2. **Etichetta "Link affiliato" per CTA.** Le linee guida AGCM/IAP chiedono che
   la natura promozionale sia riconoscibile "al primo contatto": ogni CTA
   "Prenota questi giorni" è preceduta o affiancata da un'etichetta breve
   "Link affiliato", visibile sia nella vista tabella (≥768px) sia nella vista
   card mobile. La disclosure estesa sotto la tabella resta; l'attributo
   `rel="sponsored"` è già presente e non cambia.

## Acceptance criteria

- [ ] Disclaimer visibile insieme ai risultati dopo il calcolo (test).
- [ ] Ogni CTA ha l'etichetta "Link affiliato" in vista tabella (test).
- [ ] Ogni CTA ha l'etichetta "Link affiliato" in vista card mobile (test).
- [ ] Disclosure estesa e `rel="sponsored"` invariati.
- [ ] `pnpm test` e `pnpm lint` passano.

## Blocked by

None - can start immediately
