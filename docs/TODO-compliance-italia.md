# TODO — Compliance normativa Italia (pre-lancio)

Verifica di conformità per CalcolaFerie rispetto alle regole applicabili in Italia
a servizi simili (tool web gratuito + newsletter + link di affiliazione).
Stato rilevato al 2026-07-08. Le voci "già a posto" sono verificate nel codice;
le voci TODO richiedono un'azione o una decisione.

> Nota: questo documento è una checklist tecnica, non un parere legale.
> Per la parte fiscale (P.IVA) serve un commercialista.

---

## ✅ Già a posto (verificato nel codice)

- **Informativa privacy** (`app/privacy/page.tsx`): copre titolare, dati raccolti,
  finalità, basi giuridiche, destinatari/provider, trasferimenti extra-SEE,
  conservazione, diritti dell'interessato (art. 15–21 GDPR), reclamo al Garante,
  disiscrizione. Struttura conforme agli artt. 13 GDPR.
- **Niente cookie banner necessario**: nessun cookie proprio, niente Google
  Analytics, Vercel Web Analytics è cookieless (hash della richiesta, sessioni
  scartate dopo 24h). Il `localStorage` (`calcolaferie_config`) è memorizzazione
  tecnica richiesta dall'utente → esente da consenso ex art. 5(3) direttiva
  ePrivacy e Linee guida Garante cookie (giugno 2021). Coerente anche con
  EDPB Guidelines 02/2023.
- **Consenso newsletter**: checkbox non pre-spuntata, obbligatoria, testo
  specifico, link alla privacy policy accanto al consenso (art. 7 GDPR).
- **Validazione server-side**: `POST /api/newsletter-signup` rifiuta richieste
  con `consent !== true`; la API key Buttondown è server-only.
- **Disclosure affiliazione**: riga di trasparenza vicino alle CTA + sezione
  dedicata nella privacy policy (trasparenza pubblicitaria, Codice del Consumo /
  Digital Chart IAP).
- **Minimizzazione**: il calcolo avviene nel browser; i parametri URL vengono
  rimossi prima dell'invio ad Analytics.

---

## 🔴 TODO bloccanti prima del lancio

### 1. Contatto privacy stabile (art. 13 GDPR)
La policy indica come unico recapito il profilo GitHub. Un'informativa deve dare
un recapito diretto e stabile del titolare.
- [ ] Creare una email dedicata (es. `privacy@calcolaferie.it` una volta attivo
      il dominio) e inserirla in `app/privacy/page.tsx` nelle sezioni
      "Titolare e contatto" e "Richieste privacy".
- Rif: già segnalato in `docs/issues/11-privacy-policy-missing-info.md`.

### 2. Double opt-in newsletter (prova del consenso, art. 7(1) GDPR)
La policy e la issue #09 promettono double opt-in, ma la route inoltra solo
`email_address` a Buttondown: il comportamento dipende dalle impostazioni account.
- [ ] Attivare il double opt-in nelle impostazioni Buttondown alla creazione
      dell'account (verificare che i nuovi iscritti risultino `unactivated`
      finché non confermano).
- [ ] Verificare che Buttondown conservi timestamp di iscrizione e conferma
      (serve come prova del consenso in caso di contestazione).

### 3. Trasferimenti extra-SEE (Capo V GDPR)
Buttondown e Vercel sono provider USA. La policy cita SCC/adeguatezza in modo
generico.
- [ ] Verificare la certificazione **EU–US Data Privacy Framework** di Vercel e
      Buttondown su dataprivacyframework.gov.
- [ ] Accettare/archiviare i DPA (Data Processing Agreement) di entrambi i
      provider (Vercel lo offre nel dashboard; Buttondown su richiesta/sito).
- [ ] Aggiornare la sezione "Trasferimenti fuori SEE" della policy con la
      formula consigliata: "EU–US Data Privacy Framework (o Standard
      Contractual Clauses come garanzia alternativa)" — il DPF è sotto ricorso
      CJEU (C-703/25 P), le SCC restano il fallback.

### 4. Posizione fiscale e obblighi informativi (D.lgs 70/2003, DPR 633/72)
I ricavi da affiliazione rendono il sito potenzialmente un'attività economica.
- [ ] Decidere con un commercialista se l'attività è occasionale (nessuna
      P.IVA) o abituale (apertura P.IVA, es. regime forfettario).
- [ ] Se P.IVA presente: esporla sul sito (obbligo art. 35, c.1 DPR 633/72) —
      tipicamente nel footer — insieme a nome e recapito del prestatore
      (art. 7 D.lgs 70/2003).
- [ ] In ogni caso: aggiungere nel footer identità del gestore e contatto email
      (gli obblighi informativi del D.lgs 70/2003 valgono per i "servizi della
      società dell'informazione" anche gratuiti).

---

## 🟡 TODO consigliati (non bloccanti)

### 5. Disclaimer sui risultati
Il tool suggerisce pianificazione ferie; le festività patronali e i CCNL variano.
- [ ] Aggiungere una nota visibile (footer o sotto i risultati): risultati
      indicativi, verificare sempre festività locali e regole del proprio
      contratto/datore di lavoro; nessuna responsabilità per decisioni prese
      sulla base dei risultati.

### 6. Registro dei trattamenti (art. 30 GDPR)
Formalmente esenti sotto i 250 dipendenti solo se il trattamento è occasionale —
la newsletter è continuativa, quindi un registro minimale è prudente.
- [ ] Creare un registro semplice (anche un file in `docs/`): trattamento
      newsletter (Buttondown), analytics (Vercel), finalità, base giuridica,
      conservazione, provider. Mezz'ora di lavoro, copre l'accountability.

### 7. Wording disclosure affiliazione
Le linee guida AGCM/IAP chiedono che la natura promozionale sia riconoscibile
"al primo contatto".
- [ ] Verificare che la dicitura vicino a ogni CTA contenga esplicitamente
      "link di affiliazione" (o "annuncio/adv") e non solo una spiegazione
      generica sotto la tabella.

### 8. Accessibilità (EAA / legge Stanca)
L'European Accessibility Act (in vigore da giugno 2025) si applica all'e-commerce
B2C ma esenta le microimprese (<10 addetti, <2M€); la legge Stanca vale per PA e
grandi imprese. CalcolaFerie è verosimilmente esente.
- [ ] Nessun obbligo, ma mantenere le buone pratiche già presenti (aria-label,
      contrasto, uso da mobile) — utile anche per SEO.

### 9. Menzione esplicita del localStorage nella policy
La policy parla di "dati locali del planner" genericamente.
- [ ] Citare esplicitamente `localStorage` (chiave `calcolaferie_config`), cosa
      contiene (budget, date, patrono) e che è esente da consenso in quanto
      memorizzazione tecnica richiesta dall'utente.

---

## Fuori scope confermati (nessuna azione)

- **Cookie banner**: non necessario finché non si aggiungono cookie/tracker
  propri o di terze parti (se in futuro si aggiunge Google Analytics o ads,
  questa valutazione va rifatta da zero).
- **DPO** (art. 37 GDPR): non richiesto — nessun trattamento su larga scala.
- **DPIA** (art. 35 GDPR): non richiesta — trattamento a basso rischio.
- **Obblighi editoriali/testata**: non è un prodotto editoriale.
