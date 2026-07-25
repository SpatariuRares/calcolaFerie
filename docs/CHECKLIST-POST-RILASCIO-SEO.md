# Checklist Post-Rilascio e Strategia SEO — CalcolaFerie

Questo documento sintetizza le azioni rimanenti (manuali ed esterne) da completare a seguito del rilascio di `calcolaferie.it`, con l'obiettivo di massimizzare l'indicizzazione, la visibilità sui motori di ricerca e il posizionamento nei Rich Snippets.

---

## 1. Azioni Esterne Immediate (Search Console & Registri)

### A. Google Search Console (GSC)

- [x] Accedere a [Google Search Console](https://search.google.com/search-console).
- [x] Aggiungere la proprietà **Dominio**: `calcolaferie.it`.
- [x] Aggiungere il record **TXT** di verifica fornito da Google nei DNS (su Vercel in `Settings → Domains → DNS Records` oppure su Register.it).
- [x] Inviare l'URL della sitemap: `https://calcolaferie.it/sitemap.xml`.
- [x] Usare lo strumento **Ispezione URL** inserendo `https://calcolaferie.it` e cliccare su **Richiedi indicizzazione**.

### B. Bing Webmaster Tools

- [x] Accedere a [Bing Webmaster Tools](https://www.bing.com/webmasters).
- [x] Usare l'opzione **Importa da Google Search Console** per sincronizzare sitemap e dati in 1 click.

### C. Verifica WHOIS Registro.it

- [x] Verificare nella casella mail di Register.it che la procedura di identificazione/convalida documento dell'intestatario del dominio `.it` sia completata per evitare sospensioni amministrative dal Registro.it (IIT-CNR).

---

## 2. Rilascio del Codice SEO in Produzione (v1.0.1)

Il codice locale include già le ultime ottimizzazioni On-Page (`JSON-LD Schema.org`, `Canonical URL`, `SeoFaq` e test). Per metterle live in produzione:

```bash
# 1. Commit delle modifiche SEO locali
git add .
git commit -m "feat(seo): add JSON-LD structured data, canonical URL and FAQ section"

# 2. Push su main e creazione del tag di rilascio
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

La pipeline GitHub Actions eseguirà i test e distribuirà l'aggiornamento automaticamente su Vercel.

---

## 3. Strategia SEO a Medio Termine (In-App)

Per intercettare le ricerche degli utenti legate a periodi specifici dell'anno:

- [ ] **Landing Page Stagionali Dedicate**:
  - `/ponti-2026` → Target: _"Ponti e festività 2026"_
  - `/ponte-25-aprile` → Target: _"Ponte 25 aprile 2026"_
  - `/ponte-1-maggio` → Target: _"Ponte 1 maggio 2026"_
  - `/ponte-1-novembre` → Target: _"Ponte dei Santi"_
- [ ] **Blog / Articoli di Approfondimento**:
  - Guide su come negoziare le ferie in azienda o massimizzare i giorni di stacco.

---

## 4. Off-Page SEO e Link Building

- [ ] **Lancio Social**: Condividere il link su LinkedIn, Twitter/X e gruppi reddit italiani (`r/italy`, `r/italia`, `r/italyinformatica`).
- [ ] **Directory & Aggregatori**: Inserire il progetto su Product Hunt, Indiemakers e directory di utility web italiane.
- [ ] **Verifica Anteprima Social**: Testare l'URL su [OpenGraph.xyz](https://www.opengraph.xyz/) per verificare la resa di `og-image.png`.
