# Piano pre-rilascio - Parte AI

**Ultimo aggiornamento:** 22 luglio 2026  
**Stato tecnico locale:** pronto per una preview  
**Stato produzione:** NO-GO fino al completamento delle attivita manuali ed esterne

Dettagli, risultati e rollback sono disponibili nel [rapporto di esecuzione](./RAPPORTO-PRE-RILASCIO-AI.md).

## Legenda

- [x] completato e verificato;
- [ ] ancora da eseguire;
- **Parziale:** implementata solo la parte verificabile localmente.

## P0 - Bloccanti

### Ambiente e quality gate

- [x] Allineare Node.js e pnpm.
- [x] Riparare e validare il lockfile.
- [x] Installare con `pnpm install --frozen-lockfile`.
- [x] Eseguire lint, test, build, E2E e coverage.
- [x] Correggere gli errori senza disabilitare controlli.
- [x] Verificare test esclusi, segreti e modifiche involontarie al lockfile.
- [x] Consegnare esiti e copertura nel rapporto finale.

**Evidenza:** ESLint verde; 171 test Vitest; build Next.js verde; 10 test Playwright; copertura linee 88,07%.

### CI/CD

- [x] Allineare pnpm della GitHub Action a 11.8.0.
- [x] Usare una versione Node.js supportata.
- [x] Limitare le release ai tag `v*`.
- [x] Aggiungere lint, test, build ed E2E ai gate.
- [x] Salvare screenshot, video e trace Playwright in caso di errore.
- [x] Aggiungere timeout e protezione da deploy concorrenti.
- [x] Garantire che ogni errore blocchi il deploy.
- [ ] Provare realmente il workflow con credenziali GitHub/Vercel.
- [ ] Eseguire un deploy preview/staging.

### Test della release

- [x] Coprire calcolo, risultati, calendario, persistenza e URL.
- [x] Coprire storage corrotto, budget limite, cambio anno e anno bisestile.
- [x] Coprire sovrapposizioni fra giorni speciali.
- [x] Coprire newsletter e provider indisponibile.
- [x] Coprire link affiliati e date.
- [x] Aggiungere test axe per home e privacy.
- [x] Verificare metadata, sitemap e robots.
- [x] Verificare gli header HTTP di sicurezza.

### Release candidate

- [ ] Preparare e collaudare un deploy preview.
- [x] Documentare commit di partenza ed esiti locali.
- [ ] Identificare l'ultimo deployment stabile in Vercel.
- [x] Documentare la procedura di rollback Vercel.
- [x] Documentare la disattivazione di emergenza di newsletter e affiliazione.
- [x] Consegnare la checklist manuale.
- [x] Non pubblicare senza GO esplicito.

## P1 - Importanti

### Hardening newsletter

- [ ] Configurare rate limiting distribuito con Vercel Firewall o storage condiviso.
- [x] Limitare il body e verificare `Content-Type`.
- [x] Aggiungere timeout e gestione controllata degli errori.
- [ ] Rimuovere il campo `duplicate` dalla risposta API per impedire l'enumerazione degli iscritti.
- [x] Evitare email complete nei log applicativi.
- [x] Testare body eccessivo, timeout simulato ed errore di rete.
- [ ] Testare il rate limiting dopo la configurazione dell'infrastruttura.

> Non e stato aggiunto un rate limiter in memoria: in un ambiente serverless sarebbe incoerente fra istanze e fornirebbe una protezione ingannevole.

### Persistenza e URL

- [x] Versionare lo schema `localStorage`.
- [x] Conservare la lettura del formato precedente e migrare al salvataggio successivo.
- [x] Limitare budget e numero di date.
- [x] Rifiutare parametri noti duplicati e configurazioni eccessive.
- [x] Rimuovere la query string dagli eventi Analytics.
- [ ] Aggiungere nell'interfaccia un avviso esplicito sui dati inclusi nel link condiviso.

### React, accessibilita e prestazioni

- [x] Riabilitare le regole `react/*` compatibili.
- [x] Eliminare la disabilitazione globale delle regole React.
- [x] Valutare la divisione di `vacation-planner.tsx`: rinviata per evitare un refactoring ad alto rumore senza regressioni misurate.
- [x] Correggere la violazione WCAG AA di contrasto nel footer.
- [x] Verificare con axe l'assenza di violazioni serie/critiche su home e privacy.
- [ ] Eseguire un collaudo manuale completo di tastiera, focus, screen reader, zoom e reflow.
- [ ] Eseguire Lighthouse sulla preview e registrare Core Web Vitals.
- [ ] Misurare il calendario su dispositivi mobili/lenti reali.

### Sicurezza e supply chain

- [x] Eseguire `pnpm audit --prod`.
- [x] Correggere le dipendenze transitive vulnerabili.
- [x] Verificare la policy supply-chain pnpm.
- [x] Aggiungere CSP, anti-framing, nosniff, Referrer-Policy e Permissions-Policy.
- [x] Verificare automaticamente gli header di sicurezza.
- [x] Verificare gli attributi dei link esterni e affiliati.
- [x] Verificare assenza di segreti nei file del repository esaminati.

**Evidenza:** nessuna vulnerabilita nota nelle dipendenze di produzione.

### SEO e contenuti

- [x] Verificare metadata, Open Graph, sitemap e robots.
- [x] Rendere visibile il contenuto SEO precedentemente `sr-only`.
- [x] Conservare le keyword richieste dai test SEO.
- [x] Includere un disclaimer visibile sull'accuratezza dei risultati.
- [ ] Verificare Open Graph e indicizzazione sul dominio pubblico.

### Monitoraggio

- [x] Mantenere la rimozione delle query string da Vercel Analytics.
- [ ] Definire metriche operative e soglie di allarme.
- [ ] Configurare uptime monitoring.
- [ ] Configurare destinazione e responsabile degli alert.
- [ ] Verificare Analytics con traffico reale sulla preview.

## Debito non bloccante

- [ ] Decidere se introdurre un gate Prettier globale. Attualmente `prettier --check .` segnala numerosi file storici, inclusi skill e documentazione non modificati.
- [ ] Valutare la rimozione dei warning sperimentali `localStorage` emessi da Node.js 26 nei worker jsdom.
- [ ] Rivalutare la suddivisione di `vacation-planner.tsx` solo in presenza di problemi misurati di manutenzione o rendering.

## Dopo il GO manuale

- [ ] Rieseguire lint, test, build, E2E, coverage e audit.
- [ ] Verificare che il worktree contenga soltanto le modifiche approvate.
- [ ] Preparare changelog e tag concordato.
- [ ] Osservare il workflow di produzione.
- [ ] Verificare sito, newsletter, affiliazione, Analytics e log.
- [ ] Eseguire rollback se necessario.

## Output prodotto

- [x] Modifiche tecniche e file interessati.
- [x] Esito di lint, test, build, E2E, coverage e audit.
- [x] Rischi e attivita residue.
- [x] Commit di partenza.
- [x] Procedura di rollback.
- [x] Checklist manuale separata.
- [ ] URL della preview e commit finale: disponibili soltanto dopo preview e commit autorizzati.

## Decisione corrente

La parte eseguibile interamente in locale e completata. Prima del rilascio restano:

1. preview Vercel con configurazione reale;
2. rate limiting distribuito;
3. collaudi reali Buttondown, Travelpayouts, Analytics e dispositivi;
4. completamento della [parte manuale](./PIANO-PRE-RILASCIO-MANUALE.md);
5. autorizzazione esplicita GO.
