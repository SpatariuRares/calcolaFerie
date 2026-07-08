# Da fare tu — SEO Metadata (issue #14)

Il codice è pronto. Resta la parte manuale che richiede accesso esterno o decisioni di design.

## 1. OG image reale

Il file `public/og-image.png` è un placeholder indigo 1200×630px generato programmaticamente.
Per produzione va sostituito con un'immagine branded.

- [x] Genera l'immagine con AI (prompt sotto), oppure disegnala in Figma/Canva.
- [x] Esporta a 1200×630px PNG, salvala in `public/og-image.png`.
- [x] Verifica su https://opengraphcheck.com o https://cards-dev.twitter.com/validator
      che titolo, descrizione e immagine appaiano correttamente.

### Prompt AI per generare l'OG image

Funziona con Midjourney, DALL·E 3, Ideogram, Flux, o simili.

```
A clean, modern social media preview card (Open Graph image) for a web app called
"CalcolaFerie". Horizontal format, 1200x630 pixels.

Left side: large bold text "CalcolaFerie" in white, clean sans-serif font.
Below it, smaller text in light indigo/lavender: "Calcolatore Ponti e Ferie Italiane".

Right side: a stylized monthly calendar grid. Some days are highlighted:
- green squares: recommended vacation days (ferie)
- warm orange squares: Italian public holidays
- light gray squares: weekends
The calendar should feel like a data visualization, minimal and elegant.

Background: deep indigo (#1e1b4b) to midnight blue gradient.
Accent color: indigo-400 (#818cf8) for decorative elements.
Small Italian flag emoji or subtle tricolor stripe in a corner as a locale hint.
No photography. Flat design, slight glassmorphism on the calendar card.
Overall mood: smart, trustworthy, Italian, productivity tool.
```

**Ideogram-specific addition** (ottimo per testo leggibile nelle immagini):

```
[same prompt above] --style design --aspect 1.9:1 --magic-prompt off
```

**Alternativa senza AI** — Canva template consigliato:
cerca "Social Media Preview Card" → sfondo scuro → sostituisci testi con
"CalcolaFerie" e "Calcolatore Ponti e Ferie Italiane" → esporta 1200×630.

## 2. Dominio di produzione

La variabile `NEXT_PUBLIC_BASE_URL` non è ancora impostata.
Senza di essa, `metadataBase` e l'URL assoluto dell'OG image usano il fallback
`https://calcolaferie.it`.

- [ ] Verifica che il dominio definitivo sia `calcolaferie.it` (o cambialo).
- [ ] Aggiungi `NEXT_PUBLIC_BASE_URL=https://tuo-dominio.it` in produzione
      (env var del deploy, es. Vercel → Project Settings → Environment Variables).
- [ ] Ridistribuisci dopo aver impostato la var (è `NEXT_PUBLIC_`, viene inlined
      al build).

## 3. Verifica post-deploy

- [ ] `curl -s https://tuo-dominio.it | grep 'og:image'` — deve restituire URL assoluto.
- [ ] Condividi un link su WhatsApp/Telegram: verifica che l'anteprima mostri
      titolo, descrizione e immagine.

## Fatto da me (non devi toccare)

- `app/layout.tsx`: title, description, openGraph, twitter card.
- `public/og-image.png`: placeholder 1200×630 indigo valido.
- `app/page.tsx`: sezione statica SSR con keyword "calcolatore ponti ferie".
- `tests/ui/14-seo-metadata.spec.ts`: 9 test verdi.
