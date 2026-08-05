# Piano SEO & Crescita Traffico — CalcolaFerie

_Redatto: 2026-08-05 · Basato su dati reali Vercel Analytics + Google Search Console_

## Diagnosi (dati reali)

**Vercel (ultimi 31gg):** 89 visitatori, 139 pageviews. Referrer: 83/89 "diretto" (in gran
parte il proprietario), Google organico ~1–2, social 0.

**Search Console (stesso periodo):** sito **indicizzato** ma sepolto.
Impression totali ~5–13 nel mese. Query intercettate correttamente ma in posizione 70–82:

| Query | Impr. | Pos. |
|---|---|---|
| ponti 2026 | 2 | 72,5 |
| calendario ponti 2026 | 1 | 72 |
| prossimo ponte 2026 | 1 | 82 |
| pomti 2026 (typo) | 1 | 75 |

Home in pos. 9 per alcune query (1 click). `/blog/guida-ponti-2026` in pos. 74,8 (5 impr.).

**Conclusione:** non è problema tecnico né di conversione. È **acquisizione**: dominio nuovo,
autorità ~0, quindi Google mostra il sito a pagina 7–8. Le keyword giuste sono già intercettate:
serve **autorità (backlink)** + **rinforzo on-page** per risalire.

## Divisione del lavoro

- **Priorità 1 — Backlink** (leva decisiva): gestita dal proprietario. ✅ in corso.
- **Priorità 2–4 — Codice/SEO on-page**: sotto controllo agente. Dettaglio sotto.

---

## Work Items (codice)


### WI-2 — Rinforzare i post-guida ponti come landing forti (NO route standalone)
- **Decisione:** la landing `/ponti-2027` era stata creata e poi **convertita volutamente in
  post blog**. Si prosegue su questa linea: le landing dei ponti sono i post
  `content/blog/visible/guida-ponti-2026.mdx` e `guida-ponti-2027.mdx`, non route separate.
  Evita cannibalizzazione e duplicazione.
- **Azioni (per ciascun post-guida):**
  - Assicurare che il contenuto sia una vera pillar page: **calendario completo dell'anno**,
    tabella ponte-per-ponte (festività, date, giorni di stacco, ferie da spendere, leva),
    sezione "prossimo ponte" (WI-4), FAQ interne.
  - I dati della tabella vanno generati/verificati con l'engine
    (`getPublicHolidaysForWindow` + `calculatePlan`) per essere accurati e unici.
  - `metadata`/frontmatter ottimizzati: title "Ponti 2026: calendario completo e migliori ponti",
    description con le keyword ("calendario ponti 2026", "prossimo ponte").
  - CTA verso il calcolatore (`/`) con anchor mirato.
- **Redirect:** se il vecchio URL `/ponti-2027` produce 404, aggiungere in `next.config`
  un redirect 301 → `/blog/guida-ponti-2027` (recupera eventuali link/indicizzazione pregressi).
- **File:** `content/blog/visible/guida-ponti-2026.mdx`, `guida-ponti-2027.mdx`,
  `next.config.*` (redirect). I post sono già in `app/sitemap.ts`.
- **Effort:** S–M · **Rischio:** basso

### WI-3 — Interlinking + rinforzo pagine che già rankano
- **Problema:** home, `/blog/guida-ponti-2026`, `/blog` rankano ma sono isolate (nessun link
  interno tematico che passa autorità).
- **Azioni:**
  - Home → link contestuale ai post-guida `/blog/guida-ponti-2026` e `-2027`.
  - `guida-ponti-2026.mdx`: approfondire (calendario completo, "prossimo ponte", FAQ interne),
    aggiungere link a landing e calcolatore con anchor text mirati ("calcola i tuoi ponti 2026").
  - Footer/nav: voce "Ponti 2026".
- **File:** `content/blog/visible/guida-ponti-2026.mdx`, componenti nav/footer, `app/page.tsx`.
- **Effort:** S–M · **Rischio:** basso

### WI-4 — Sezione dinamica "Prossimo ponte"
- **Obiettivo:** intercettare query ad alta intenzione/bassa concorrenza ("prossimo ponte 2026",
  "prossimo ponte") viste in Search Console.
- **Azione:** componente che, da `localToday()` + engine, calcola e mostra il prossimo ponte
  utile con countdown. Riutilizzabile su home e landing.
- **File nuovi:** `app/_components/molecules/next-bridge.tsx` (+ helper in `app/_lib/`).
- **Effort:** S · **Rischio:** basso

### WI-5 — Schema `HowTo` + wiring `FaqJsonLd`
- **Stato:** `FaqJsonLd` esiste già in `app/_components/atoms/json-ld.tsx`. Verificare che sia
  effettivamente montato nella pagina `/faq`. `HowTo` assente.
- **Azioni:**
  - Aggiungere `HowToJsonLd` ("Come calcolare i ponti 2026 in 3 passi") montato su home/landing.
  - Verificare/montare `FaqJsonLd` su `/faq`.
- **File:** `app/_components/atoms/json-ld.tsx`, `app/page.tsx`, `app/faq/page.tsx`.
- **Effort:** S · **Rischio:** nullo (solo markup, guadagna rich snippet in SERP)

### WI-6 — Calendario editoriale (contenuti stagionali)
- Cadenza 1–2 post/settimana da agosto a novembre, per arrivare "caldi" al picco di domanda
  di dicembre. Query informazionali target: "quanti giorni di ferie mi spettano", "come funziona
  il ponte", "ROL e permessi", "ferie non godute".
- **Effort:** continuativo (infra blog + RAG già presente).

---

## Ordine di esecuzione consigliato

2. WI-2 (rinforzo post-guida ponti) — massimo impatto SEO
3. WI-4 (prossimo ponte) — riusato da WI-2 e home
4. WI-3 (interlinking) — distribuisce autorità
5. WI-5 (schema) — rich snippet
6. WI-6 (editoriale) — continuativo, in parallelo

## Come misurare

- **Search Console** ogni 2 settimane: posizione media su "ponti 2026" & co. Target: da 72 → <20
  entro la stagione, <10 al picco di dicembre.
- **Vercel:** quota referrer organico/social vs diretto. Target: organico da ~2% → maggioranza.
- KPI leading: impression totali (oggi ~5–13/mese) → crescita prima ancora dei click.
