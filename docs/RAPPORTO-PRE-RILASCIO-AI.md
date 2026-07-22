# Rapporto esecuzione piano pre-rilascio AI

**Data:** 22 luglio 2026  
**Commit di partenza:** `d35cf0e63000e342d5cafb14b9a6b13099c839d0`  
**Deploy eseguiti:** nessuno

## Esito

La parte tecnica locale e pronta per una release candidate. I gate automatici passano; restano attivita che richiedono infrastruttura o autorizzazione del gestore.

## Interventi completati

### Toolchain e supply chain

- riparato il lockfile, che conteneva due documenti YAML concatenati;
- impostati Node.js `>=22.13.0` e pnpm `11.8.0`;
- rimossa la configurazione `devEngines.packageManager` duplicata;
- approvati esplicitamente gli script di build di `sharp` e `unrs-resolver`;
- allineate le versioni Vitest a `4.1.10`;
- applicati override alle versioni corrette di `immutable`, `postcss` e `sharp`;
- verificata la policy supply-chain di pnpm;
- eseguito `pnpm audit --prod`: nessuna vulnerabilita nota.

### CI/CD

- trigger produzione limitato ai tag `v*`;
- aggiunto avvio manuale `workflow_dispatch`;
- allineati Node.js 24 e pnpm 11.8;
- aggiunti lint, test, build ed E2E prima del deploy;
- aggiunti timeout, concurrency e artifact Playwright in caso di errore.

### Applicazione

- riattivate le regole ESLint React;
- corretti i testi JSX segnalati;
- aggiunti CSP e header HTTP di sicurezza;
- resa visibile la sezione informativa SEO;
- corretto il contrasto del footer secondo WCAG AA;
- versionato lo schema `localStorage` mantenendo compatibilita con i valori esistenti;
- aggiunti limiti a budget, date e parametri URL duplicati/eccessivi;
- aggiunti limite body, controllo content type, timeout e gestione errori alla newsletter;
- rimossa la possibilita che errori di rete del provider causino una risposta non controllata.

### Test

- rimosso un test dipendente dalla data assoluta del calendario;
- aggiunti test newsletter per content type, body e provider irraggiungibile;
- aggiunti test per storage versionato, budget massimo e parametri duplicati;
- aggiunti E2E axe su home e privacy;
- aggiunti E2E sugli header di sicurezza;
- aggiunti screenshot, video e trace Playwright in caso di errore.

## Evidenze dei quality gate

| Gate             | Esito                                              |
| ---------------- | -------------------------------------------------- |
| ESLint           | Passato, 0 errori                                  |
| Vitest           | 21 file, 171 test passati                          |
| Next.js build    | Passata, TypeScript incluso                        |
| Playwright       | 10 test passati                                    |
| Axe              | Nessuna violazione seria/critica su home e privacy |
| Audit produzione | Nessuna vulnerabilita nota                         |
| Policy pnpm      | Lockfile approvato                                 |

### Copertura

| Metrica      | Copertura |
| ------------ | --------: |
| Statements   |    83,70% |
| Branches     |    75,38% |
| Functions    |    83,78% |
| Lines        |    88,07% |
| Engine lines |      100% |

## Attivita AI non completabili localmente

### Bloccanti per la release pubblica

- creare e collaudare un deploy preview Vercel con le variabili reali;
- eseguire il collaudo reale Buttondown e Travelpayouts;
- ricevere il GO esplicito del gestore;
- creare tag e deploy, non autorizzati in questa esecuzione.

### Importanti

- configurare rate limiting distribuito per la newsletter tramite Vercel Firewall o storage condiviso. Non e stata aggiunta una mappa in memoria, perche in serverless sarebbe incoerente tra istanze e darebbe una falsa garanzia;
- eseguire Lighthouse sulla preview pubblica e registrare Core Web Vitals;
- configurare uptime monitoring e alert;
- provare il workflow GitHub Actions con credenziali e ambiente reali;
- verificare browser Safari/iOS e Chrome Android reali.

### Debito non bloccante

- `prettier --check .` segnala numerosi file storici, inclusi skill e documentazione non modificati. I file toccati in questa esecuzione sono stati formattati; non e stato prodotto un rewrite globale fuori scope;
- Node.js 26 emette warning sperimentali su `localStorage` nei worker jsdom, senza impatto sull'esito dei test;
- il componente `vacation-planner.tsx` resta grande. Non e stato spezzato senza una regressione misurata, evitando un refactoring ad alto rumore prima della release.

## Procedura di rollback

### Prima del deploy

1. Non creare il tag se un gate non e verde.
2. Correggere sul branch e rieseguire lint, test, build ed E2E.
3. Usare un nuovo commit candidato; non riscrivere un tag gia pubblicato.

### Dopo il deploy

1. In Vercel individuare l'ultimo deployment stabile.
2. Promuoverlo nuovamente a produzione.
3. Se il problema e nel codice, creare un commit `git revert` della release difettosa.
4. Rieseguire tutti i gate e pubblicare una nuova patch version.
5. Se il problema riguarda la newsletter, revocare temporaneamente `BUTTONDOWN_API_KEY`.
6. Se riguarda l'affiliazione, rimuovere temporaneamente il marker o disabilitare le CTA con una patch verificata.
7. Documentare causa, periodo di impatto e azione correttiva.

## Decisione

**Stato tecnico locale:** pronto per preview.  
**Stato produzione:** NO-GO finche la parte manuale e le verifiche esterne non sono completate.
