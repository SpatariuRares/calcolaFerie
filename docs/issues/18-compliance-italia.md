# PRD — Compliance Italia: parti implementabili nel codice

Deriva da `docs/TODO-compliance-italia.md`. Questo PRD copre solo ciò che è
implementabile nel repo; i passi manuali (account, verifiche esterne,
commercialista) restano nel TODO e in `docs/issues/18-compliance-TODO-manuale.md`.

## Problem Statement

CalcolaFerie sta per andare online in Italia con newsletter e link di
affiliazione. La verifica di conformità ha trovato lacune che espongono il
gestore a rischi legali evitabili: l'informativa privacy non offre un recapito
diretto del titolare, il double opt-in della newsletter è promesso ma non
garantito dal codice, la sezione sui trasferimenti extra-SEE è generica rispetto
allo stato attuale del Data Privacy Framework, il sito non espone l'identità del
gestore come richiesto dal D.lgs 70/2003, i risultati del planner non hanno un
disclaimer, e la natura affiliata dei link di prenotazione non è riconoscibile
"al primo contatto" su ogni CTA come chiedono le linee guida AGCM/IAP.

## Solution

Portare a livello di codice tutto ciò che non dipende da account esterni: il
double opt-in viene forzato dalla route newsletter (indipendente dai settings
del provider), l'informativa privacy viene completata con recapito email,
formula corretta sui trasferimenti e menzione esplicita del localStorage, il
footer del planner espone identità e contatto del gestore (con uno slot
opzionale per la P.IVA attivabile in seguito), un disclaimer chiarisce che i
risultati sono indicativi, ogni CTA di prenotazione è etichettata come link
affiliato, e un registro dei trattamenti minimale viene versionato nella
documentazione del progetto.

## User Stories

1. Come utente che vuole esercitare i propri diritti GDPR, voglio trovare un indirizzo email dedicato nell'informativa privacy, così da poter contattare il titolare senza dover usare GitHub.
2. Come utente che si iscrive alla newsletter, voglio ricevere un'email di conferma prima di essere aggiunto alla lista, così da essere certo che nessuno possa iscrivermi a mia insaputa.
3. Come titolare del trattamento, voglio che il double opt-in sia imposto dal codice della route e non da un'impostazione dell'account del provider, così da non poter finire fuori norma per una configurazione dimenticata.
4. Come utente attento alla privacy, voglio leggere nell'informativa quale meccanismo copre il trasferimento dei miei dati verso provider USA, così da capire quali garanzie si applicano.
5. Come utente attento alla privacy, voglio sapere esattamente cosa il sito salva nel mio browser e con quale chiave, così da poterlo verificare e cancellare da solo.
6. Come visitatore del sito, voglio vedere nel footer chi gestisce il servizio e come contattarlo, così da sapere con chi sto interagendo come richiesto dalla legge italiana.
7. Come gestore del sito, voglio uno slot P.IVA nel footer che si attiva solo quando la configuro, così da poter adempiere all'obbligo di esposizione senza un nuovo sviluppo quando il commercialista avrà deciso.
8. Come utente che pianifica le ferie, voglio un avviso che i risultati sono indicativi e che festività locali e regole contrattuali vanno verificate, così da non prendere decisioni sbagliate fidandomi ciecamente del tool.
9. Come utente che guarda la tabella dei ponti, voglio capire che "Prenota questi giorni" è un link affiliato prima di cliccarlo, così da decidere consapevolmente come richiesto dalle regole sulla trasparenza pubblicitaria.
10. Come utente che naviga da mobile, voglio che l'etichetta di link affiliato sia visibile anche nella vista a card, così da avere la stessa trasparenza della vista tabella.
11. Come titolare del trattamento, voglio un registro dei trattamenti versionato con il progetto, così da dimostrare accountability (art. 30 GDPR) se il Garante lo chiede.
12. Come utente che legge l'informativa, voglio che la finalità e la conservazione dei dati della newsletter citino la conferma double opt-in, così che il testo corrisponda al comportamento reale del sistema.
13. Come manutentore del progetto, voglio che tutte le modifiche di testo legale siano coperte da test che ne verificano la presenza, così che una rimozione accidentale venga intercettata prima del deploy.
14. Come gestore del sito, voglio che i passi manuali rimanenti siano elencati in un documento dedicato con lo stesso formato già usato per l'affiliazione, così da avere una checklist chiara di ciò che resta da fare a me.

## Implementation Decisions

- **Double opt-in forzato dalla route newsletter.** La richiesta verso il
  provider include `type: "unactivated"` nel payload di creazione subscriber:
  il provider invia l'email di conferma e l'iscritto non riceve nulla finché
  non conferma. Decisione: il vincolo vive nel codice, non nelle impostazioni
  dell'account, così la garanzia è versionata e testabile. Il contratto della
  route verso il client non cambia (stessi status code e stessi messaggi).
- **Recapito privacy.** L'informativa usa `privacy@calcolaferie.it` come
  contatto del titolare nelle sezioni "Titolare e contatto" e "Richieste
  privacy"; il profilo GitHub resta come canale aggiuntivo. La creazione della
  casella è un passo manuale.
- **Trasferimenti extra-SEE.** La sezione dell'informativa adotta la formula
  "EU–US Data Privacy Framework (o Standard Contractual Clauses come garanzia
  alternativa)", riflettendo lo stato attuale del DPF (valido ma sotto ricorso
  CJEU). La verifica della certificazione DPF dei provider è manuale.
- **Menzione esplicita del localStorage.** L'informativa nomina la chiave
  `calcolaferie_config`, elenca cosa contiene (budget ferie, date di chiusura,
  patrono) e chiarisce che è memorizzazione tecnica richiesta dall'utente,
  esente da consenso ex art. 5(3) direttiva ePrivacy.
- **Footer con identità del gestore.** Il footer del planner (già esistente,
  oggi solo link Privacy) aggiunge: nome del gestore, email di contatto, e la
  P.IVA quando disponibile. La P.IVA arriva da una variabile d'ambiente
  pubblica: se assente, la riga non viene renderizzata. Nessun nuovo
  componente: si estende il footer esistente.
- **Disclaimer risultati.** Una riga sotto i risultati (visibile solo dopo il
  primo calcolo, insieme alla tabella) avvisa che i risultati sono indicativi e
  che festività patronali e regole del proprio contratto vanno verificate.
  Posizionata nel componente tabella risultati, accanto alla disclosure
  affiliazione già presente.
- **Etichetta affiliato per CTA.** Ogni CTA "Prenota questi giorni" è preceduta
  o affiancata da un'etichetta breve "Link affiliato" visibile sia nella vista
  tabella sia nella vista card mobile. La disclosure estesa sotto la tabella
  resta. L'attributo `rel="sponsored"` è già presente e non cambia.
- **Registro dei trattamenti.** Documento markdown in `docs/` con una tabella
  per trattamento: newsletter (provider email), statistiche di visita
  (analytics hosting), affiliazione — ognuno con finalità, base giuridica,
  categorie di dati, destinatari, trasferimenti, conservazione. Formato
  minimale conforme all'art. 30 GDPR.
- **Documento TODO manuale.** I passi che restano al gestore (casella email,
  settings e verifica double opt-in sul provider, verifica DPF/DPA,
  commercialista/P.IVA) vengono raccolti in
  `docs/issues/18-compliance-TODO-manuale.md`, stesso formato di
  `12-affiliate-TODO-manuale.md`, con label `manual`.
- **Nessuna modifica all'engine.** Tutto il lavoro è nel layer app e nella
  documentazione.

## Testing Decisions

- I test verificano solo comportamento osservabile: testo visibile all'utente e
  richieste HTTP in uscita — mai dettagli di implementazione.
- **Route newsletter (seam esistente, MSW):** il test intercetta la richiesta
  verso il provider e asserisce che il payload contiene `type: "unactivated"`
  oltre a `email_address`. I casi esistenti (consenso mancante, email invalida,
  duplicato, key assente) restano verdi senza modifiche. Prior art: il test
  della iscrizione newsletter già presente nella suite UI.
- **Contenuti statici (seam esistente, jsdom + testing-library):**
  - pagina privacy: presenza dell'email di contatto, della formula DPF/SCC,
    della chiave localStorage citata. Prior art: il test della privacy policy.
  - tabella risultati: etichetta "Link affiliato" presente per ogni CTA in
    entrambe le viste; disclaimer risultati presente. Prior art: il test della
    tabella risultati.
  - footer: nome gestore ed email presenti; riga P.IVA assente senza variabile
    e presente con variabile impostata. Prior art: i test del planner che
    rendono il componente principale.
- Nessun nuovo progetto di test, nessun nuovo mock server: si estendono i due
  seam esistenti (vitest project `ui` + MSW).
- Il registro dei trattamenti e il TODO manuale sono documentazione: nessun test.

## Out of Scope

- Creazione della casella `privacy@calcolaferie.it` (manuale).
- Apertura account Buttondown, verifica che i nuovi iscritti risultino
  `unactivated` e che il provider conservi i timestamp di conferma (manuale).
- Verifica certificazione Data Privacy Framework di Vercel e Buttondown e
  archiviazione dei DPA (manuale).
- Decisione fiscale occasionale/abituale e apertura P.IVA (commercialista).
- Cookie banner: non necessario con lo stack attuale; fuori scope finché non
  si aggiungono tracker propri o di terze parti.
- DPO e DPIA: non richiesti per questo trattamento.
- Registrazione dominio, Google Search Console, e tutto ciò che è già nel
  PRD deploy.

## Further Notes

- Il valore `type: "unactivated"` segue l'API v1 subscribers di Buttondown:
  verificare in implementazione il nome esatto del campo nella versione
  corrente dell'API prima di fissare il payload.
- L'email `privacy@calcolaferie.it` comparirà nel bundle e nelle pagine
  pubbliche: attivare la casella prima del primo deploy pubblico, altrimenti le
  richieste privacy vanno perse (rischio peggiore del profilo GitHub attuale).
- La variabile P.IVA è pubblica per natura (deve comparire nel footer): il
  prefisso pubblico è corretto, non è un segreto.
- Se in futuro si aggiunge un tracker di terze parti, la valutazione cookie
  banner in `docs/TODO-compliance-italia.md` va rifatta da zero.
