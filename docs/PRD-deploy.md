# PRD — Deploy & SEO CalcolaFerie

## Problem Statement

CalcolaFerie esiste come progetto funzionante in locale ma non è accessibile pubblicamente. Gli utenti italiani che cercano strumenti per ottimizzare le ferie sfruttando i ponti non possono trovare né usare il tool. Il sito non ha metadati SEO, non genera sitemap, non ha immagini Open Graph, e non ha nessun meccanismo di rilascio controllato in produzione.

## Solution

Pubblicare CalcolaFerie su Vercel con un dominio `.it` custom, aggiungere tutti gli asset SEO necessari per l'indicizzazione su Google, configurare Vercel Analytics per misurare il traffico dal giorno 1, e mettere in piedi una pipeline CI/CD su GitHub Actions che deploya in produzione solo quando viene pushato un tag git — garantendo che ogni release sia intenzionale e che i test passino prima di andare live.

## User Stories

1. Come utente italiano che cerca su Google "calcolatore ponti ferie", voglio trovare CalcolaFerie nei risultati di ricerca, così da poter usare il tool senza doverlo cercare direttamente.
2. Come utente che condivide il link su WhatsApp o Telegram, voglio vedere un'anteprima visiva con titolo e immagine, così da invogliare i miei contatti a cliccare.
3. Come utente che arriva sul sito per la prima volta, voglio capire immediatamente a cosa serve il tool leggendo un testo introduttivo statico, così da decidere se compilare il form.
4. Come utente che visita `/privacy`, voglio che la pagina sia indicizzabile e linkabile, così da poter condividere le informazioni sulla privacy.
5. Come sviluppatore che fa una release, voglio pushare un tag git e aspettare che la pipeline validi e deploya automaticamente, così da non dover triggerare il deploy manualmente.
6. Come sviluppatore, voglio che il deploy non parta se i test falliscono, così da non portare roba rotta in produzione.
7. Come proprietario del sito, voglio vedere le statistiche di traffico giornaliero su Vercel Analytics, così da capire quali keyword portano visitatori e ottimizzare il contenuto nel tempo.
8. Come proprietario del sito, voglio che il dominio sia `calcolaferie.it` (non un subdomain Vercel), così da costruire brand authority e link equity nel tempo.
9. Come utente che si iscrive alla newsletter, voglio che il form continui a funzionare (o fallisca silenziosamente) anche se la API key Buttondown non è configurata, così da non vedere errori di sistema.
10. Come Google bot, voglio trovare un `/sitemap.xml` aggiornato, così da indicizzare tutte le pagine pubbliche senza bisogno di crawl esaustivo.
11. Come Google bot, voglio trovare un `/robots.txt` che mi dica esplicitamente di non indicizzare le route API, così da non sprecare crawl budget su endpoint non pubblici.
12. Come sviluppatore che lavora su un branch, voglio avere un preview deployment automatico su URL temporaneo per ogni PR, così da testare le modifiche in ambiente reale prima di mergiare.

## Implementation Decisions

### Piattaforma di deploy
- **Vercel** come piattaforma di hosting. Supporto nativo Next.js, CDN globale, preview deployments per ogni branch, gestione env vars integrata.
- **Auto-deploy da GitHub disabilitato** nelle impostazioni Vercel — il deploy in produzione è controllato esclusivamente dalla pipeline GitHub Actions.
- Preview deployments su branch restano **abilitati** (Vercel li gestisce indipendentemente dall'auto-deploy su main).

### Dominio
- Dominio custom `.it` — registrato su Namecheap o Porkbun.
- DNS configurato su Vercel dopo l'acquisto.
- Il dominio `.it` rafforza la rilevanza geografica per ricerche italiane.

### Pipeline CI/CD (GitHub Actions)
- Trigger: `push` su tag matching `v*` (es. `v1.0.0`, `v1.2.3`).
- Sequenza: `pnpm test` → `pnpm build` → `vercel --prod` (Vercel CLI).
- Se `pnpm test` fallisce, la pipeline si ferma e il deploy non avviene.
- Secrets richiesti in GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER`.
- `BUTTONDOWN_API_KEY` va in Vercel env vars (non in GitHub Secrets) — è un segreto runtime, non build-time.

### Variabili d'ambiente in Vercel
| Variabile | Stato | Note |
|-----------|-------|-------|
| `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` | Da configurare subito | Già presente in `.env.local` |
| `BUTTONDOWN_API_KEY` | Da aggiungere dopo | Senza key l'API risponde 503 gracefully |

### SEO — metadata
- `app/layout.tsx`: metadata completo con `title`, `description`, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Card.
- Keyword primaria: **"calcolatore ponti ferie"**. Keyword secondaria: **"ottimizzare ferie 2026"**.
- Titolo pagina: `CalcolaFerie — Calcolatore Ponti e Ferie Italiane`.
- Descrizione: `Scopri i ponti del 2026 e ottimizza le tue ferie. Inserisci il tuo budget di giorni e CalcolaFerie trova le combinazioni migliori con le festività italiane.`

### SEO — sitemap e robots
- `app/sitemap.ts`: genera `/sitemap.xml` con le route `/` e `/privacy`. Usare il dominio `.it` come base URL.
- `app/robots.ts`: genera `/robots.txt`. Blocca `/api/*` da tutti i crawler. Permette tutto il resto. Include riferimento alla sitemap.

### SEO — contenuto statico
- `app/page.tsx`: aggiungere sezione statica visibile (non nascosta) con testo descrittivo ricco di keyword, sopra o sotto il componente `VacationPlanner`.
- Il componente `VacationPlanner` resta client-side; la sezione statica è server-rendered e indicizzabile da Google.
- Contenuto minimo: titolo H1, paragrafo descrittivo, lista dei benefici del tool.

### Open Graph image
- Immagine statica `public/og-image.png`, dimensioni 1200×630px.
- Placeholder testuale per il primo deploy — può essere sostituita con una versione grafica in seguito.
- Referenziata nel metadata come URL assoluto con dominio `.it`.

### Vercel Analytics
- Installare pacchetto `@vercel/analytics`.
- Aggiungere `<Analytics />` in `app/layout.tsx`.
- Nessun cookie banner richiesto — Vercel Analytics è privacy-first per default.

## Testing Decisions

**Cosa costituisce un buon test per questa feature:** verificare che i file generati esistano e abbiano il contenuto corretto (sitemap con le route giuste, robots con le regole giuste, metadata nel HTML), e che la pipeline CI/CD esegua i passi nella sequenza corretta. Non testare l'implementazione interna di Next.js.

**Moduli da testare:**

- `app/sitemap.ts` — unit test: verifica che ritorni le entry corrette per `/` e `/privacy` con `lastModified` e `changeFrequency` sensati.
- `app/robots.ts` — unit test: verifica che le regole blocchino `/api/*` e permettano `/`.
- `app/layout.tsx` — test UI esistente in `tests/ui/`: verifica che il tag `<title>` e i meta OG siano presenti nel DOM renderizzato.
- `app/page.tsx` — test UI: verifica che il contenuto statico SEO sia presente nel markup (non dipendente da interazione utente).
- Pipeline GitHub Actions — nessun test automatico; validare manualmente pushando un tag su un branch di test prima della prima release.

**Prior art:** i test UI esistenti in `tests/ui/*.spec.ts` usano vitest + jsdom + Testing Library — stesso pattern da usare per i nuovi test sui metadata.

## Out of Scope

- Internazionalizzazione (i18n) — il sito resta italiano.
- Google Search Console setup — da fare manualmente dopo il primo deploy.
- Link building e content marketing — fuori scope tecnico.
- Immagine Open Graph custom/brandizzata — il placeholder è sufficiente per il lancio.
- Account Buttondown e configurazione newsletter completa — da fare in una fase successiva.
- Monitoring degli errori (Sentry, ecc.) — non incluso in questa fase.
- Rate limiting sull'API route newsletter — già gestito gracefully, hardening da considerare in futuro.
- `next/font` optimization — fuori scope per ora.

## Further Notes

- La pipeline deploya con `vercel --prod` che bypassa il branch linking — assicurarsi che `VERCEL_PROJECT_ID` punta al progetto corretto prima della prima release.
- Il dominio `.it` richiede verifica identità WHOIS (documento d'identità) — mettere in conto 1-2 giorni lavorativi per l'attivazione completa.
- Vercel Analytics free tier ha limite di 2.500 eventi/mese — sufficiente per la fase di lancio.
- `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` è una variabile pubblica (prefisso `NEXT_PUBLIC_`): viene embeddrata nel bundle client-side. Non inserire segreti con questo prefisso.
