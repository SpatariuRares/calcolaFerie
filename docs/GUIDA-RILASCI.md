# Guida ai rilasci — CalcolaFerie

Guida passo-passo per fare un rilascio in produzione, da zero. Copre sia il **setup iniziale** (da fare una volta sola) sia il **flusso di rilascio ricorrente** (da fare a ogni release).

Riferimenti nel repo:
- Pipeline: `.github/workflows/deploy.yml`
- Decisioni architetturali: `docs/PRD-deploy.md`

---

## Come funziona il rilascio

Il deploy in produzione **non è automatico su push a `main`**. Parte solo quando viene pushato un **tag git**. La pipeline GitHub Actions (`.github/workflows/deploy.yml`):

1. Fa checkout del codice
2. Installa pnpm leggendo la versione da `devEngines.packageManager` in `package.json` (nessuna versione hardcoded nel workflow — evita mismatch col lockfile)
3. Installa le dipendenze (`pnpm install --frozen-lockfile`)
4. Esegue `pnpm test` — se fallisce, la pipeline si ferma qui e **non va in produzione**
5. Esegue lo smoke E2E (`playwright test tests/smoke/golden-path.spec.ts`) contro un'istanza locale (`pnpm dev` auto-avviato da Playwright) — se fallisce, stop
6. `vercel pull --environment=production` — scarica config e env var dal progetto Vercel
7. `vercel build --prod` — build fatta interamente in CI
8. `vercel deploy --prebuilt --prod` — deploya **esattamente** l'artefatto appena buildato e testato (nessuna re-build lato Vercel)

Questo garantisce che ogni release sia intenzionale (serve un tag esplicito), che codice rotto non arrivi mai in produzione (test + smoke E2E bloccano la pipeline), e che ciò che va live sia bit-per-bit ciò che è stato testato in CI (deploy prebuilt, non una rebuild remota separata).

---

## Parte 1 — Setup iniziale (una tantum)

Da fare solo la prima volta, prima del primo rilascio.

### 1.1 Creare il progetto su Vercel

1. Vai su [vercel.com](https://vercel.com) e crea un progetto collegato al repo GitHub `SpatariuRares/calcolaFerie`.
2. Durante l'import, Vercel rileva automaticamente il framework Next.js.
3. **Importante**: dopo l'import, vai in `Settings → Git` e **disabilita l'auto-deploy da GitHub** sul branch `main`. Il deploy in produzione deve passare solo dalla pipeline GitHub Actions, non dall'integrazione automatica di Vercel.
   - I preview deployment sui branch/PR restano invece **abilitati** — Vercel li gestisce indipendentemente.

### 1.2 Recuperare le credenziali Vercel

Ti servono tre valori da passare come secrets a GitHub:

```bash
pnpm dlx vercel login
pnpm dlx vercel link
```

Dopo `vercel link`, trovi `orgId` e `projectId` nel file generato `.vercel/project.json`.

Per il token: vai su [vercel.com/account/tokens](https://vercel.com/account/tokens) e crea un nuovo token con scope sul progetto.

### 1.3 Configurare i secrets su GitHub

Vai su `Settings → Secrets and variables → Actions` nel repo GitHub e aggiungi:

| Secret | Valore |
|--------|--------|
| `VERCEL_TOKEN` | Token generato al punto 1.2 |
| `VERCEL_ORG_ID` | Da `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Da `.vercel/project.json` |
| `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` | Stesso valore già presente in `.env.local` locale |

**Nota**: `BUTTONDOWN_API_KEY` (se/quando usata) va configurata come env var **in Vercel**, non come GitHub Secret — è un segreto runtime, non serve in fase di build.

### 1.4 Configurare le env var in Vercel

In `Settings → Environment Variables` sul progetto Vercel, aggiungi (ambiente Production):

| Variabile | Note |
|-----------|------|
| `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` | La pipeline la passa comunque esplicitamente allo step di build via GitHub Secret — impostarla anche su Vercel tiene i due ambienti coerenti (es. rebuild manuali da dashboard) |
| `BUTTONDOWN_API_KEY` | **Solo runtime, mai in CI/build** — senza, l'API newsletter risponde 503 in modo silenzioso |

`vercel pull --environment=production` scarica le env var di Production dal progetto Vercel prima della build — è il meccanismo con cui `BUTTONDOWN_API_KEY` (se impostata) finisce disponibile a runtime nella funzione serverless, senza mai transitare da GitHub Secrets.

### 1.5 Dominio custom

Domini acquistati su **Register.it**: `calcolaferie.it` (canonico) e `calcola-ferie.it` (redirect).

`calcolaferie.it` è già il default hardcoded in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` (fallback di `NEXT_PUBLIC_BASE_URL` quando la env var non è impostata) — non serve settare `NEXT_PUBLIC_BASE_URL` a meno di volerlo sovrascrivere.

**Collegare i domini a Vercel:**

1. Dashboard Vercel → progetto → `Settings → Domains`.
2. Aggiungi `calcolaferie.it` — dominio canonico.
3. Aggiungi `calcola-ferie.it` — quando Vercel chiede la configurazione, impostalo come **Redirect** verso `calcolaferie.it` (redirect 308, evita contenuto duplicato lato SEO).

**DNS su Register.it** (per ciascuno dei due domini): Vercel mostra nel pannello del dominio i record esatti da usare in quel momento — seguili da lì, non fissarli da questa guida (possono cambiare). Due opzioni:

- **Nameserver Vercel** (consigliato): su Register.it → gestione DNS del dominio → sostituisci i nameserver con quelli indicati da Vercel (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`). Da quel momento il DNS si gestisce da Vercel.
- **Record singoli su Register.it**: se preferisci tenere il DNS su Register.it, aggiungi il record A (apex) e CNAME (`www`) che Vercel mostra nella pagina del dominio.

Propagazione: da pochi minuti a 24-48h. Vercel segnala nel pannello quando il dominio risulta verificato.

**Verifica identità WHOIS**: il `.it` richiede verifica (codice fiscale o documento) — completala su Register.it per **entrambi** i domini, altrimenti restano sospesi e irraggiungibili.

### 1.6 Verifica del setup

Prima del primo rilascio vero, valida la pipeline su un tag di test:

```bash
git tag v0.0.1-test
git push origin v0.0.1-test
```

Controlla in GitHub Actions che la pipeline parta e completi tutti gli step. Poi elimina il tag di test:

```bash
git tag -d v0.0.1-test
git push origin :refs/tags/v0.0.1-test
```

E su Vercel rimuovi eventualmente il deployment di test se non vuoi tenerlo come produzione corrente.

---

## Parte 2 — Flusso di rilascio (a ogni release)

### 2.1 Pre-check locale

Prima di taggare, verifica in locale che tutto sia verde:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Se hai tempo, esegui anche lo smoke test end-to-end:

```bash
pnpm test:smoke
```

### 2.2 Assicurati di essere allineato su `main`

```bash
git checkout main
git pull origin main
```

Il tag va creato sul commit di `main` che vuoi rilasciare — non su un branch di lavoro.

### 2.3 Aggiorna la versione (facoltativo ma consigliato)

Il campo `version` in `package.json` è attualmente `1.0.0`. Se vuoi tenerlo sincronizzato col tag:

```bash
npm version patch   # 1.0.0 → 1.0.1 (bugfix)
npm version minor    # 1.0.0 → 1.1.0 (nuova feature)
npm version major    # 1.0.0 → 2.0.0 (breaking change)
```

`npm version` aggiorna `package.json`, crea un commit e **crea già il tag** — in tal caso salta il comando `git tag` al punto successivo e vai diretto al push.

Se preferisci taggare manualmente senza toccare `package.json`, salta questo step.

### 2.4 Crea e pusha il tag

Se non hai usato `npm version`:

```bash
git tag v1.0.1
git push origin main        # se ci sono commit nuovi
git push origin v1.0.1
```

Se hai usato `npm version` (che ha già creato il tag):

```bash
git push origin main --follow-tags
```

**Il formato del tag conta**: la pipeline si attiva su push di un tag (pattern `*`), niente branch. Segui SemVer (`vMAJOR.MINOR.PATCH`, es. `v1.2.3`) per coerenza.

### 2.5 Osserva la pipeline

Vai su GitHub → tab `Actions` → workflow "Deploy to Vercel (production)". Segui i log degli step descritti in "Come funziona il rilascio" sopra (install, test, smoke E2E, pull, build, deploy).

- Se `pnpm test` o lo smoke E2E falliscono, la pipeline si ferma: **niente va in produzione**. Correggi il bug, ripeti da 2.1 con un nuovo tag (non riusare lo stesso tag).
- Se tutto passa, l'ultimo step (`vercel deploy --prebuilt --prod`) mette in produzione l'artefatto già buildato e testato, e il sito è live su `calcolaferie.it`.

### 2.6 Verifica post-deploy

1. Apri il sito in produzione e controlla che la modifica sia visibile.
2. Controlla su Vercel → tab `Deployments` che il deployment marcato "Production" corrisponda al tag appena pushato.
3. Controlla Vercel Analytics per eventuali errori anomali nelle ore successive.

---

## Rollback

Se un rilascio ha problemi in produzione, due opzioni:

**A. Rollback da Vercel (più veloce)**
Vai su Vercel → `Deployments`, trova l'ultimo deployment production funzionante, clicca `⋯ → Promote to Production`. Rimette in produzione la build precedente senza dover ripassare dalla pipeline.

**B. Rollback via tag (per la storia git)**
Fai il fix (o revert) su `main`, poi pusha un nuovo tag con versione incrementata (es. `v1.0.2`). Non riusare/spostare un tag già pushato: i tag vanno considerati immutabili una volta rilasciati.

---

## Riepilogo comandi

```bash
# setup una tantum
pnpm dlx vercel login
pnpm dlx vercel link

# ogni rilascio
git checkout main && git pull origin main
pnpm lint && pnpm test && pnpm build
npm version patch                    # oppure minor/major
git push origin main --follow-tags
# → segui la pipeline su GitHub Actions
```
