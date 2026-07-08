# Cosa devi fare tu — Compliance Italia (issue #18)

Il repo contiene le parti implementabili e la bozza del registro trattamenti.
Restano passi manuali, verifiche esterne e decisioni che non posso completare
dal codice. Dove un dato non e confermato, lascialo come TODO finche non lo
verifichi.

## 1. Casella privacy

- [ ] Creare la casella `privacy@calcolaferie.it`.
- [ ] Verificare invio e ricezione da un indirizzo esterno.
- [ ] Decidere chi controlla la casella e con quale frequenza.
- [ ] Aggiornare eventuali TODO nel registro se il contatto legale cambia.

## 2. Account Buttondown e double opt-in

- [ ] Verificare nella dashboard Buttondown che i nuovi iscritti restino non
      attivati finche non confermano via email.
- [ ] Verificare che Buttondown conservi timestamp di iscrizione, conferma e
      disiscrizione come prova del consenso.
- [ ] Archiviare termini, DPA o accordo privacy applicabile al provider.
- [ ] Annotare nel registro il periodo effettivo di conservazione esposto da
      Buttondown.

## 3. DPF, SCC e DPA dei provider

- [ ] Verificare su https://www.dataprivacyframework.gov/ la certificazione
      Data Privacy Framework di Vercel.
- [ ] Verificare su https://www.dataprivacyframework.gov/ la certificazione
      Data Privacy Framework di Buttondown.
- [ ] Archiviare i DPA di Vercel e Buttondown.
- [ ] Se un provider non e certificato o la certificazione non copre il
      trattamento usato, documentare le Standard Contractual Clauses o altra
      garanzia applicabile.

## 4. Commercialista, P.IVA e dati del titolare

- [ ] Chiedere al commercialista se l'attivita e occasionale o abituale.
- [ ] Se serve P.IVA, aprirla e impostare in produzione
      `NEXT_PUBLIC_PIVA=...`.
- [ ] Confermare il nome o la denominazione del titolare da usare in footer,
      privacy policy e registro trattamenti.
- [ ] Aggiornare `docs/registro-trattamenti.md` sostituendo i TODO sui dati
      del titolare.

## Fatto nel repo

- Bozza registro trattamenti in `docs/registro-trattamenti.md`.
- Privacy policy con contatto `privacy@calcolaferie.it`, formula DPF/SCC e
  localStorage esplicito.
- Route newsletter con subscriber Buttondown `type: "unactivated"`.
- Footer con contatto del gestore e slot P.IVA condizionale.
