# Brief progetto — Tool ottimizzazione ferie

_Documento di contesto per la sessione "grill me". Sintetizza obiettivi e decisioni prese finora._

---

## Obiettivo in una frase

Tool web gratuito dove inserisci chiusure aziendali e giorni obbligati, e ti dice **quali ferie prendere per massimizzare i giorni di stacco**, sfruttando ponti e festività.

- **Target:** dipendenti in Italia. Secondario: agenzie (B2B).
- **Monetizzazione:** affiliazione viaggi (primaria) → ads sul volume → eventuale "pro" → B2B white-label.

## Posizionamento (perché vince)

Non un **calendario passivo** che ti fa fare i conti, ma un **consulente** che dà la risposta col _perché_. Due pilastri:

1. **Consigli automatici con spiegazione** — motore deterministico che calcola la leva + layer che la spiega in italiano ("il 25 aprile è giovedì → 1 giorno di ferie = 4 di stacco").
2. **UX pulita, mobile-first** — i concorrenti sono tappezzati di ads e ingestibili da telefono.

**Fossato:** affiliazione invece di ads → più resa per visita _e_ sito pulito. I concorrenti non possono ripulirsi senza uccidere il proprio fatturato.

---

## Decisioni tecniche prese

- **Framework: Next.js (App Router).** SSR/SSG di default → niente problema SEO della SPA pura. Scelto su Astro/TanStack perché la traiettoria punta a una _toolbox per dipendenti_ (SaaS), e Next è la casa giusta per quel futuro; in più è il tool già conosciuto → si spedisce in fretta.
- **Newsletter: Buttondown.** Serve solo per validare interesse dopo il calcolo: raccolta email con double opt-in, unsubscribe gestito dal provider e invio manuale di aggiornamenti. Niente Supabase/custom leads database in V1.
- **Motore: TypeScript puro, framework-agnostic.** È il pezzo che vale e deve restare portabile.
- **Contenuti SEO: markdown/MDX generati statici.** Devono arrivare a Google come HTML pronto.
- **Tool: componente interattivo client.** Pagina transazionale, non punta a posizionarsi.
- **TanStack accantonato** (zero esperienza + framework giovane = rischio su un progetto che deve spedire). Eventuale assaggio: TanStack Query dentro il tool.

### Spec motore (alto livello)

Festività nazionali fisse + **Pasqua/Pasquetta** (computus) + **patrono regionale** (differenziatore italiano). Calcolo **leva** = giorni di stacco ÷ ferie spese, tenendo conto di chiusure e giorni obbligati. V1 = ranking dei singoli ponti; poi ottimizzatore budget-aware.

---

## Principi e vincoli

- **Validazione prima del codice.** La Fase 0 non è ancora fatta. Nessuna riga finché il go/no-go non è verde.
- **Scope stretto:** in build solo il tool ferie. Next _regge_ la toolbox futura, ma non la si costruisce ora (non validata).
- **SEO da subito:** Google ci mette mesi; picco di pianificazione novembre-gennaio.
- **Basso rimpianto:** engine (TS), contenuti (md) e lista email esportabile da Buttondown sono portabili → la scelta del framework non è una porta a senso unico.
- **GDPR:** consenso esplicito per la raccolta email, double opt-in e privacy policy minima prima del go-live.

## Fase attuale

**Pre-Fase 0.** Prossimo passo reale = validazione (keyword research, analisi concorrenti, parlare con persone). Niente codice ancora.

---

## Punti aperti — su cui farti grigliare

**Validazione**

- Keyword research fatta? Volumi e stagionalità reali, o solo ipotesi?
- Chi sono i concorrenti italiani e qual è il buco preciso che colmi?
- Qualcuno ha confermato il bisogno o lasciato la mail?

**Motore**

- Come gestisci festività mobili e patroni regionali senza sbagliare gli edge case?
- Ottimizzatore: greedy o budget-aware? Come definisci la "leva" quando ci sono giorni obbligati o chiusure imposte?
- Multi-anno: lo fai subito o lo rimandi?

**Prodotto / business**

- Analytics: GA4 o cookieless (Plausible/Umami) — coerenza con la UX pulita e niente cookie banner?
- Affiliazione: quale programma, quali requisiti (sito già live + traffico minimo), resa per click stimata?
- Inquadramento fiscale (forfettario) previsto?

**Disciplina di scope**

- Definizione di "fatto" per l'MVP?
- Cosa, esplicitamente, NON costruisci ora?
- Cosa ti frena dal saltare la validazione e metterti a codare subito?
