# Piano completo pre-rilascio — CalcolaFerie

> Il piano e suddiviso per responsabilita: [Parte AI](./PIANO-PRE-RILASCIO-AI.md) e [Parte manuale](./PIANO-PRE-RILASCIO-MANUALE.md). Questo documento resta il riferimento dettagliato comune.

**Stato del documento:** bozza operativa  
**Data dell'analisi:** 22 luglio 2026  
**Obiettivo:** portare CalcolaFerie dall'attuale stato del repository a un rilascio pubblico verificato, ripetibile e gestibile in sicurezza.

> Questo documento e una checklist tecnica e organizzativa, non un parere legale o fiscale. Le decisioni su P.IVA, inquadramento dell'attivita, trasferimenti internazionali e obblighi specifici devono essere confermate da professionisti qualificati.

## 1. Verdetto sintetico

Il prodotto e vicino al rilascio dal punto di vista funzionale, ma non deve ancora essere considerato pronto per il go-live.

Prima della pubblicazione occorre:

1. installare le dipendenze ed eseguire realmente tutti i quality gate;
2. correggere e provare la pipeline di rilascio;
3. configurare dominio, Vercel, Buttondown e Travelpayouts;
4. chiudere le attivita manuali di compliance e identificazione del gestore;
5. collaudare in un ambiente preview il flusso completo su desktop e mobile;
6. preparare monitoraggio minimo, rollback e verifica post-deploy.

Il go-live e autorizzabile soltanto quando tutte le attivita marcate **P0 — bloccante** risultano completate e documentate.

## 2. Ambito verificato

L'analisi comprende:

- engine TypeScript e logica di calcolo;
- interfaccia Next.js/React;
- persistenza in `localStorage` e condivisione tramite URL;
- newsletter e integrazione Buttondown;
- link affiliati Travelpayouts/Booking.com;
- Vercel Analytics;
- privacy policy e registro dei trattamenti;
- test Vitest e Playwright;
- configurazione ESLint, TypeScript, pnpm e Husky;
- workflow GitHub Actions e deploy Vercel;
- SEO tecnico, sitemap, robots e Open Graph.

Limite dell'analisi: nel workspace non e presente `node_modules`. Non e stato quindi possibile confermare con un'esecuzione locale l'esito di lint, test, build ed E2E. I relativi controlli restano obbligatori.

## 3. Definizione delle priorita

| Priorita | Significato   | Regola                                                                                            |
| -------- | ------------- | ------------------------------------------------------------------------------------------------- |
| **P0**   | Bloccante     | Deve essere chiuso prima del rilascio pubblico.                                                   |
| **P1**   | Importante    | Da chiudere preferibilmente prima del rilascio; rinviabile solo con rischio accettato e annotato. |
| **P2**   | Miglioramento | Puo essere pianificato subito dopo il lancio.                                                     |

## 4. Piano di lavoro consigliato

L'ordine raccomandato e:

1. ripristino ambiente e quality gate locali;
2. correzioni tecniche emerse dai controlli;
3. hardening della newsletter;
4. aggiornamento CI/CD;
5. configurazione dei servizi esterni;
6. chiusura compliance e dati del gestore;
7. deploy preview e collaudo completo;
8. release candidate, tag e deploy produzione;
9. verifiche post-rilascio.

## 5. P0 — Ripristinare e validare l'ambiente di sviluppo

### 5.1 Installare le dipendenze

- [ ] Verificare la versione di Node.js prevista per sviluppo e CI.
- [ ] Usare pnpm compatibile con il requisito dichiarato in `package.json` (`^11.8.0`).
- [ ] Eseguire:

```bash
pnpm install --frozen-lockfile
```

- [ ] Confermare che l'installazione non modifichi inaspettatamente `pnpm-lock.yaml`.
- [ ] Se il lockfile cambia, comprenderne il motivo e versionare la modifica separatamente.

**Criterio di accettazione:** installazione pulita da zero, senza errori e senza modifiche non spiegate al lockfile.

### 5.2 Eseguire tutti i quality gate

Eseguire nell'ordine:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm test:coverage
```

- [ ] `pnpm lint` termina con exit code 0.
- [ ] Tutti i progetti Vitest (`engine` e `ui`) passano.
- [ ] La build di produzione Next.js termina senza errori o warning critici.
- [ ] Tutti i test Playwright passano in Chromium.
- [ ] Il report coverage viene conservato come riferimento iniziale.
- [ ] Nessun test e marcato `.skip`, `.only` o equivalente senza motivazione.
- [ ] Ripetere almeno una volta la suite da un clone/installazione pulita.

**Criterio di accettazione:** tutti i comandi passano sul commit candidato al rilascio.

### 5.3 Verificare il worktree

```bash
git status --short --branch
git diff --check
```

- [ ] Worktree pulito prima della creazione del tag.
- [ ] Nessun file `.env`, token, API key o output di test accidentalmente tracciato.
- [ ] `test-results/`, `.next/`, coverage e file temporanei sono ignorati correttamente.

## 6. P0 — Correggere e rendere affidabile la CI/CD

Il workflow attuale usa pnpm 9, mentre `package.json` richiede pnpm `^11.8.0`. Inoltre esegue soltanto `pnpm test` e `pnpm build`: lint e smoke/E2E non proteggono il deploy.

### 6.1 Allineare runtime e package manager

- [ ] Portare `pnpm/action-setup` alla versione pnpm compatibile con il progetto.
- [ ] Dichiarare una versione Node.js supportata da Next.js 16 e coerente con lo sviluppo locale.
- [ ] Valutare l'aggiunta del campo `packageManager` in `package.json` per rendere l'ambiente riproducibile.
- [ ] Verificare che il lockfile sia leggibile dalla versione pnpm usata in CI.

### 6.2 Ampliare i gate della pipeline

La pipeline di release deve eseguire almeno:

1. `pnpm install --frozen-lockfile`;
2. `pnpm lint`;
3. `pnpm test`;
4. `pnpm build`;
5. `pnpm test:e2e` oppure almeno `pnpm test:smoke`.

- [ ] Caricare trace e screenshot Playwright come artifact quando un test fallisce.
- [ ] Impostare un timeout ragionevole del job.
- [ ] Aggiungere `concurrency` per evitare due deploy concorrenti dello stesso ambiente.
- [ ] Limitare il trigger dei tag a `v*`, coerentemente con il PRD, invece di qualsiasi tag.
- [ ] Proteggere l'ambiente GitHub `production`, se disponibile, con approvazione manuale.

**Criterio di accettazione:** un errore di lint, test, build o smoke impedisce il deploy.

### 6.3 Provare il workflow senza rischiare la produzione

- [ ] Collegare un progetto Vercel di staging o usare un deploy preview.
- [ ] Creare un tag di prova non produttivo oppure eseguire il workflow manualmente tramite `workflow_dispatch`.
- [ ] Verificare che `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` puntino al progetto corretto.
- [ ] Verificare che il token Vercel abbia privilegi minimi sufficienti.
- [ ] Confermare che il deploy prodotto dal workflow contenga le variabili attese.

## 7. P0 — Variabili d'ambiente e segreti

### 7.1 Inventario

| Variabile                          | Ambiente       | Sensibilita    | Necessita                                |
| ---------------------------------- | -------------- | -------------- | ---------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`             | Build/runtime  | Pubblica       | Impostare a `https://calcolaferie.it`.   |
| `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` | Build client   | Pubblica       | Obbligatoria per monetizzare i link.     |
| `BUTTONDOWN_API_KEY`               | Runtime server | Segreta        | Obbligatoria per newsletter attiva.      |
| `NEXT_PUBLIC_PIVA`                 | Build client   | Pubblica       | Impostare solo se fiscalmente richiesta. |
| `VERCEL_TOKEN`                     | GitHub Actions | Segreta        | Necessaria al deploy CI.                 |
| `VERCEL_ORG_ID`                    | GitHub Actions | Identificativo | Necessaria al deploy CI.                 |
| `VERCEL_PROJECT_ID`                | GitHub Actions | Identificativo | Necessaria al deploy CI.                 |

### 7.2 Azioni

- [ ] Configurare le variabili per Production e, dove utile, Preview.
- [ ] Non usare mai il prefisso `NEXT_PUBLIC_` per segreti.
- [ ] Non inserire valori reali in `.env.example`.
- [ ] Verificare che `BUTTONDOWN_API_KEY` non compaia nel bundle client, nei log o negli artifact.
- [ ] Stabilire responsabile e periodicita della rotazione dei token.
- [ ] Revocare immediatamente eventuali chiavi usate in test se esposte.

**Criterio di accettazione:** il deploy di produzione funziona con configurazione Vercel, senza dipendere da un `.env.local` non versionato.

## 8. P0 — Configurare e collaudare Buttondown

### 8.1 Account e sicurezza

- [ ] Creare l'account con un indirizzo del dominio ufficiale.
- [ ] Abilitare MFA, se supportata.
- [ ] Limitare l'accesso agli amministratori necessari.
- [ ] Generare una API key dedicata e salvarla in Vercel.
- [ ] Documentare chi puo accedere all'account e chi gestisce le richieste degli utenti.

### 8.2 Double opt-in

La route invia il subscriber come `type: "unactivated"`, ma il comportamento reale deve essere verificato sul provider.

- [ ] Eseguire un'iscrizione reale con un indirizzo di prova.
- [ ] Confermare che nessuna newsletter sia inviata prima della conferma.
- [ ] Confermare la ricezione dell'email di conferma.
- [ ] Confermare che il link di conferma attivi il subscriber.
- [ ] Confermare che Buttondown conservi timestamp di richiesta, conferma e disiscrizione per dimostrare il consenso (GDPR art. 7(1)).
- [ ] Verificare il flusso di unsubscribe.
- [ ] Verificare come vengono gestiti indirizzi gia iscritti.

### 8.3 Esperienza utente ed errori

- [ ] Testare email valida, email non valida e consenso assente.
- [ ] Testare API key mancante.
- [ ] Testare provider non raggiungibile, timeout e risposta 5xx.
- [ ] Testare doppio invio rapido.
- [ ] Evitare messaggi che rivelino se un indirizzo appartiene gia alla lista.
- [ ] Confermare che l'utente riceva un messaggio comprensibile senza dettagli interni.

## 9. P1 — Hardening della route newsletter

La route attuale non include rate limiting esplicito e non intercetta errori o timeout della chiamata `fetch` verso Buttondown.

### 9.1 Protezione da abuso

- [ ] Aggiungere rate limiting per IP e/o identificatore equivalente, considerando i proxy Vercel.
- [ ] Definire una soglia conservativa e una finestra temporale.
- [ ] Rispondere con `429 Too Many Requests` senza esporre dettagli sensibili.
- [ ] Valutare un honeypot invisibile come protezione aggiuntiva a basso impatto.
- [ ] Non introdurre CAPTCHA invasivi senza un abuso reale che lo giustifichi.

### 9.2 Robustezza della chiamata al provider

- [ ] Usare `AbortSignal.timeout(...)` o un `AbortController` per limitare la durata della richiesta.
- [ ] Racchiudere il `fetch` in gestione esplicita delle eccezioni.
- [ ] Restituire un errore controllato quando il provider e irraggiungibile.
- [ ] Limitare la dimensione accettata del body.
- [ ] Verificare `Content-Type: application/json`.
- [ ] Aggiungere test per timeout, errore di rete e body eccessivo.

### 9.3 Logging rispettoso della privacy

- [ ] Registrare solo tipo di errore, status e correlation ID.
- [ ] Non scrivere indirizzi email completi nei log applicativi.
- [ ] Se serve correlazione, usare un valore pseudonimizzato e documentarne la necessita.
- [ ] Definire retention e accessi dei log (GDPR artt. 5(1)(e), 25 e 32).

## 10. P0 — Configurare e verificare Travelpayouts

- [ ] Creare l'account Travelpayouts.
- [ ] Attivare il programma Booking.com.
- [ ] Recuperare il marker affiliato.
- [ ] Inserire `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` in Vercel Production.
- [ ] Verificare nella dashboard gli identificativi `p=4115` e `campaign_id=101`.
- [ ] Aprire link generati da almeno tre opportunita diverse.
- [ ] Confermare check-in e check-out corretti nel sito di destinazione.
- [ ] Confermare attribuzione del marker e registrazione del click nella dashboard.
- [ ] Testare l'apertura su desktop e mobile.
- [ ] Verificare i requisiti contrattuali sul wording promozionale.
- [ ] Conservare copia dei termini accettati e annotare la data.

**Criterio di accettazione:** i link portano alla pagina prevista, contengono date corrette e attribuiscono il click all'account reale.

## 11. P0 — Dominio, DNS e Vercel

- [ ] Registrare o confermare la proprieta di `calcolaferie.it`.
- [ ] Completare eventuale verifica richiesta per il dominio `.it`.
- [ ] Configurare DNS secondo le indicazioni Vercel.
- [ ] Impostare il dominio canonico e il redirect coerente tra `www` e apex.
- [ ] Verificare emissione e rinnovo automatico TLS.
- [ ] Impostare `NEXT_PUBLIC_BASE_URL=https://calcolaferie.it`.
- [ ] Verificare metadata, Open Graph, sitemap e robots sul dominio finale.
- [ ] Verificare che preview e produzione non condividano per errore configurazioni sensibili.
- [ ] Disabilitare deploy automatici concorrenti se la produzione deve essere controllata esclusivamente dal workflow a tag.

## 12. P0 — Compliance privacy e organizzativa

### 12.1 Dati personali trattati

Il sistema tratta almeno:

- indirizzo email della newsletter, dato personale ai sensi del GDPR art. 4(1);
- dati tecnici e metriche di visita gestiti da Vercel;
- dati tecnici relativi ai click affiliati gestiti dai provider dopo l'uscita dal sito;
- configurazione del planner salvata localmente nel browser e, se condivisa, inserita nella query string.

Non risultano categorie particolari di dati ex art. 9. Gli utenti devono comunque evitare di inserire informazioni personali non necessarie nei meccanismi di condivisione.

### 12.2 Identita del titolare e contatto

- [ ] Confermare nome completo o denominazione del titolare del trattamento (GDPR artt. 4(7), 13(1)(a)).
- [ ] Creare `privacy@calcolaferie.it`.
- [ ] Verificare invio e ricezione dall'esterno.
- [ ] Stabilire chi controlla la casella e con quale frequenza.
- [ ] Aggiornare privacy policy, footer e registro con dati coerenti.
- [ ] Eliminare tutti i placeholder/TODO pubblicabili.

### 12.3 Consenso newsletter

- [ ] Confermare che il consenso sia separato, libero, specifico, informato e non pre-selezionato (GDPR artt. 6(1)(a), 7; considerando 32).
- [ ] Conservare prova del consenso e della conferma (art. 7(1)).
- [ ] Rendere semplice la revoca tramite unsubscribe (art. 7(3)).
- [ ] Verificare che la finalita dichiarata corrisponda alle comunicazioni effettivamente inviate (art. 5(1)(b)).

### 12.4 Responsabili e trasferimenti

- [ ] Identificare il ruolo privacy di Vercel, Buttondown e Travelpayouts.
- [ ] Archiviare i DPA applicabili con Vercel e Buttondown (art. 28).
- [ ] Verificare sub-responsabili e paesi di trattamento.
- [ ] Verificare il meccanismo per i trasferimenti extra-SEE (artt. 44-49).
- [ ] Se si usa il Data Privacy Framework, documentare l'esatta entita certificata e la copertura del servizio (art. 45).
- [ ] Mantenere documentazione sulle SCC o altra garanzia applicabile come alternativa, dove necessaria (art. 46).
- [ ] Aggiornare privacy policy e registro con dati verificati, non formule generiche.

### 12.5 Conservazione e diritti

- [ ] Definire un periodo di conservazione concreto per iscrizioni, prova del consenso e log (art. 5(1)(e)).
- [ ] Documentare cancellazione e gestione unsubscribe.
- [ ] Predisporre una procedura per richieste di accesso, rettifica, cancellazione, limitazione e opposizione (artt. 15-21).
- [ ] Annotare chi risponde e come viene rispettato il termine previsto dall'art. 12(3).
- [ ] Verificare che la cancellazione sia propagata ai provider pertinenti.

### 12.6 Sicurezza e incidenti

- [ ] Abilitare MFA sugli account GitHub, Vercel, Buttondown, registrar e Travelpayouts.
- [ ] Applicare privilegi minimi agli account e alle API key (art. 32).
- [ ] Documentare una procedura minima di data breach: rilevazione, contenimento, valutazione, registro e notifica, se necessaria (artt. 33-34).
- [ ] Definire chi puo accedere ai dati newsletter e ai log.
- [ ] Riesaminare periodicamente le misure adottate (artt. 24, 25 e 32).

### 12.7 Registro dei trattamenti

- [ ] Sostituire i TODO presenti in `docs/registro-trattamenti.md`.
- [ ] Inserire responsabile del documento e data di revisione.
- [ ] Confermare finalita, categorie di dati, interessati, destinatari, trasferimenti, retention e misure di sicurezza (art. 30).
- [ ] Conservare le evidenze collegate: DPA, SCC/DPF, termini provider e LIA se applicabile.

## 13. P0 — Posizione fiscale e informazioni del gestore

- [ ] Chiedere a un commercialista se i ricavi affiliati configurano attivita occasionale o abituale.
- [ ] Se necessaria, aprire la P.IVA prima di iniziare l'attivita rilevante.
- [ ] Se applicabile, configurare `NEXT_PUBLIC_PIVA` in produzione.
- [ ] Verificare quali dati identificativi e fiscali devono comparire nel footer e nelle pagine legali.
- [ ] Allineare denominazione del gestore tra sito, contratti provider e documenti interni.
- [ ] Definire come vengono registrati e dichiarati i ricavi affiliati.

## 14. P1 — Persistenza locale e URL condivisi

La configurazione e salvata in `localStorage` con chiave `calcolaferie_config`; alcune date possono essere incluse negli URL condivisi.

- [ ] Aggiungere una versione allo schema persistito, per gestire future migrazioni senza invalidare silenziosamente i dati.
- [ ] Definire una strategia di migrazione o reset per versioni non supportate.
- [ ] Limitare il numero massimo di date accettate da URL e storage.
- [ ] Limitare il budget massimo a un valore di dominio realistico, non soltanto a un intero sicuro.
- [ ] Verificare URL estremamente lunghi e parametri duplicati.
- [ ] Confermare che i parametri non vengano inviati a Vercel Analytics; il codice attuale rimuove la query string tramite `beforeSend`.
- [ ] Spiegare all'utente che copiando il link condivide le date incluse nella configurazione.

## 15. P1 — Qualita React, accessibilita e prestazioni

### 15.1 ESLint

La configurazione disabilita tutte le regole `react/*` importate da `eslint-config-next`.

- [ ] Identificare quali regole causano problemi reali con React 19/Next.js 16.
- [ ] Riabilitare le regole React compatibili.
- [ ] Disabilitare soltanto regole specifiche, con commento che ne spieghi il motivo.
- [ ] Proteggere in particolare regole hooks, accessibilita e pattern di rendering.

### 15.2 Componente principale

`vacation-planner.tsx` concentra molto stato e numerose responsabilita.

- [ ] Misurare prima di ottimizzare con React DevTools/Profiler.
- [ ] Valutare l'estrazione di form, calendario, persistenza e newsletter in componenti/hook indipendenti.
- [ ] Evitare nuove responsabilita nel componente principale.
- [ ] Valutare memoizzazione soltanto per calcoli o render dimostrati costosi.

### 15.3 Accessibilita

- [ ] Eseguire test automatico axe sulla pagina principale e `/privacy`.
- [ ] Verificare navigazione completa da tastiera.
- [ ] Verificare focus visibile e ordine del focus.
- [ ] Verificare annunci screen reader per errori, risultati e copia link.
- [ ] Verificare semantica della tabella e delle righe interattive.
- [ ] Testare zoom al 200% e reflow a 320 px.
- [ ] Controllare contrasto dei testi, badge e stati selezionati.
- [ ] Verificare che la griglia calendario sia comprensibile senza affidarsi solo al colore.

### 15.4 Prestazioni

- [ ] Eseguire Lighthouse su preview in modalita mobile e desktop.
- [ ] Registrare LCP, CLS, INP e peso JavaScript iniziale.
- [ ] Verificare che font e immagine Open Graph non rallentino la pagina visibile.
- [ ] Verificare il costo del rendering dei dodici mesi su dispositivi lenti.
- [ ] Evitare dipendenze client aggiuntive non necessarie.

## 16. P0 — Collaudo funzionale della release candidate

### 16.1 Flusso principale

- [ ] Aprire la home senza dati salvati.
- [ ] Inserire un budget valido e calcolare.
- [ ] Verificare opportunita, leva, costo e budget residuo.
- [ ] Selezionare e deselezionare opportunita.
- [ ] Selezionare ferie dal calendario.
- [ ] Ricaricare la pagina e verificare la persistenza.
- [ ] Copiare il link e aprirlo in una finestra anonima.
- [ ] Confermare la precedenza dell'URL sul `localStorage`.

### 16.2 Casi limite

- [ ] Budget zero.
- [ ] Budget molto alto.
- [ ] Chiusura aziendale nel weekend.
- [ ] Giorno obbligatorio sovrapposto a festivita.
- [ ] Santo patrono fuori e dentro la finestra di 12 mesi.
- [ ] Date a cavallo del cambio anno.
- [ ] Anno bisestile.
- [ ] Configurazione salvata corrotta.
- [ ] URL con date non valide, duplicate o fuori finestra.
- [ ] Nessuna opportunita trovata.
- [ ] Selezioni che superano il budget.

### 16.3 Browser e dispositivi

- [ ] Chrome/Edge desktop.
- [ ] Firefox desktop.
- [ ] Safari macOS, se disponibile.
- [ ] Safari iOS.
- [ ] Chrome Android.
- [ ] Modalita privata o storage non disponibile.
- [ ] Clipboard API negata o non disponibile.

## 17. P0 — SEO e contenuti pubblici

- [ ] Verificare `<title>`, description, canonical/metadata base e lingua `it`.
- [ ] Verificare anteprima Open Graph di `og-image.png` sul dominio finale.
- [ ] Verificare `https://calcolaferie.it/sitemap.xml`.
- [ ] Verificare `https://calcolaferie.it/robots.txt`.
- [ ] Confermare che `/api/` non sia indicizzata.
- [ ] Verificare che `/privacy` sia raggiungibile dal footer e indicizzabile.
- [ ] Valutare la sezione SEO attualmente `sr-only`: il PRD chiedeva contenuto statico visibile. Decidere consapevolmente se renderla visibile e utile all'utente.
- [ ] Verificare che i testi non promettano accuratezza assoluta.
- [ ] Controllare date e riferimenti annuali per evitare contenuti presto obsoleti.
- [ ] Dopo il rilascio, configurare Google Search Console e inviare la sitemap.

## 18. P1 — Sicurezza applicativa e supply chain

- [ ] Eseguire un audit delle dipendenze e valutare le vulnerabilita effettivamente applicabili.
- [ ] Aggiornare dipendenze solo con test completi, evitando upgrade automatici incontrollati prima del lancio.
- [ ] Verificare che i link esterni usino `rel="noopener noreferrer"`; quelli affiliati anche `sponsored`.
- [ ] Valutare header di sicurezza: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e protezione framing.
- [ ] Definire una CSP compatibile con Next.js, Vercel Analytics e font.
- [ ] Verificare assenza di source map pubbliche contenenti informazioni sensibili.
- [ ] Attivare Dependabot/Renovate con PR controllate, se desiderato.
- [ ] Abilitare secret scanning e branch protection su GitHub.

## 19. P1 — Osservabilita e supporto

- [ ] Verificare che Vercel Analytics riceva page view senza query string.
- [ ] Definire metriche minime: disponibilita, errori route newsletter, latenza e tasso di successo.
- [ ] Configurare un controllo uptime per home e, opzionalmente, un health check non invasivo.
- [ ] Stabilire dove arrivano gli alert e chi li prende in carico.
- [ ] Evitare che log e alert contengano email o URL completi con configurazioni utente.
- [ ] Preparare una risposta standard per problemi newsletter, privacy e risultati errati.

Un sistema completo come Sentry puo essere rinviato; prima del lancio deve comunque esistere un modo minimo per accorgersi che il sito o la newsletter non funzionano.

## 20. P0 — Preparare rollback e gestione incidenti

- [ ] Identificare l'ultimo deployment stabile in Vercel.
- [ ] Provare la procedura di rollback in staging/preview.
- [ ] Documentare chi puo promuovere o ripristinare un deployment.
- [ ] Conservare il commit SHA e il tag associato a ogni release.
- [ ] Preparare la disattivazione rapida della newsletter rimuovendo/revocando la API key.
- [ ] Preparare la disattivazione dei link affiliati se risultano errati o non conformi.
- [ ] Definire quando mostrare una pagina di manutenzione o sospendere il servizio.

## 21. Procedura della prima release

### 21.1 Creare la release candidate

- [ ] Chiudere tutte le P0.
- [ ] Aggiornare questo documento con stato e note.
- [ ] Eseguire tutti i quality gate sul commit finale.
- [ ] Pubblicare un deploy preview dal commit candidato.
- [ ] Eseguire collaudo funzionale, accessibilita e servizi reali sulla preview.
- [ ] Far rileggere privacy, footer e disclosure al titolare.

### 21.2 Approvazione go/no-go

Il rilascio riceve **GO** solo se:

- [ ] test, lint, build ed E2E sono verdi;
- [ ] dominio e TLS sono pronti;
- [ ] variabili e segreti sono configurati;
- [ ] newsletter reale e double opt-in funzionano;
- [ ] link affiliati reali sono verificati;
- [ ] titolare, contatto privacy e posizione fiscale sono definiti;
- [ ] DPA/trasferimenti sono documentati;
- [ ] privacy policy e registro non contengono placeholder bloccanti;
- [ ] rollback e responsabile operativo sono definiti.

### 21.3 Tag e deploy

Esempio:

```bash
git status --short --branch
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

- [ ] Osservare il workflow fino al completamento.
- [ ] Non creare un nuovo tag per correggere un job ancora in corso.
- [ ] Se un gate fallisce, correggere su un nuovo commit e creare una nuova versione/tag secondo la convenzione scelta.

## 22. Verifiche immediatamente dopo il deploy

Entro 15 minuti:

- [ ] Aprire home e privacy dal dominio pubblico.
- [ ] Verificare certificato TLS e redirect canonico.
- [ ] Eseguire un calcolo completo.
- [ ] Copiare e riaprire un URL condiviso.
- [ ] Eseguire una iscrizione newsletter di prova.
- [ ] Aprire un link affiliato e verificarne i parametri.
- [ ] Controllare log Vercel per errori 5xx.
- [ ] Verificare sitemap, robots e Open Graph.
- [ ] Verificare che Analytics riceva eventi senza query string.

Entro 24 ore:

- [ ] Controllare uptime e tasso errori.
- [ ] Controllare la consegna dell'email double opt-in.
- [ ] Verificare eventuali click affiliati di test.
- [ ] Verificare indicizzazione iniziale/Search Console.
- [ ] Annotare problemi e decisione di rollback o prosecuzione.

## 23. Attivita post-lancio

### Prima settimana

- [ ] Correggere errori reali ad alta frequenza.
- [ ] Monitorare performance mobile e newsletter.
- [ ] Rivedere feedback sugli algoritmi e sulle festivita locali.
- [ ] Definire una baseline di conversione newsletter e click affiliati senza raccogliere dati eccedenti.

### Primo mese

- [ ] Riesaminare dipendenze e alert di sicurezza.
- [ ] Riesaminare registro trattamenti e retention effettiva dei provider.
- [ ] Verificare che le procedure di cancellazione funzionino.
- [ ] Pianificare refactoring del componente `vacation-planner.tsx` soltanto sulla base di problemi osservati.
- [ ] Ampliare test browser se il traffico mostra piattaforme non coperte.

## 24. Matrice responsabilita

| Area                 | Responsabile suggerito      | Evidenza richiesta                                |
| -------------------- | --------------------------- | ------------------------------------------------- |
| Codice, test e build | Sviluppatore                | Log comandi e commit SHA.                         |
| CI/CD e Vercel       | Sviluppatore/gestore        | Workflow verde e URL deployment.                  |
| Dominio e DNS        | Gestore                     | DNS e TLS verificati.                             |
| Buttondown           | Gestore                     | Iscrizione e conferma di prova.                   |
| Travelpayouts        | Gestore                     | Link/click attribuito in dashboard.               |
| Privacy e provider   | Titolare/consulente privacy | Policy, DPA e registro aggiornati.                |
| Fiscalita/P.IVA      | Gestore/commercialista      | Decisione scritta e dati pubblicati se necessari. |
| Go/no-go             | Titolare del prodotto       | Checklist P0 firmata/datata.                      |

## 25. Registro decisioni e deroghe

Ogni P1 rinviata deve essere annotata qui prima del rilascio.

| Data | Attivita rinviata | Rischio accettato | Mitigazione temporanea | Responsabile | Scadenza |
| ---- | ----------------- | ----------------- | ---------------------- | ------------ | -------- |
|      |                   |                   |                        |              |          |

Le P0 non devono essere trasformate informalmente in P1. Qualsiasi deroga richiede una motivazione esplicita del titolare del prodotto e, per gli aspetti legali/fiscali, del professionista competente.

## 26. Documenti correlati

- `docs/PRD-deploy.md`
- `docs/TODO-compliance-italia.md`
- `docs/registro-trattamenti.md`
- `docs/issues/12-affiliate-TODO-manuale.md`
- `docs/issues/18-compliance-TODO-manuale.md`
- `.github/workflows/deploy.yml`
- `.env.example`

## 27. Nota legale

Queste indicazioni sono informative, basate sulla struttura tecnica osservata e sui principi del GDPR. Non costituiscono consulenza legale o fiscale. Per trasferimenti internazionali, contratti con responsabili, obblighi informativi, P.IVA e valutazioni con rischio sanzionatorio, consultare un avvocato privacy/DPO e un commercialista qualificati.
