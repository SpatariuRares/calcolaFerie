# Cosa devi fare tu — Affiliazione (issue #12)

Il codice è pronto. Restano i passi manuali (account esterni + config) che io
non posso fare al posto tuo.

## 1. Account Travelpayouts

- [ ] Registrati su https://www.travelpayouts.com
- [ ] Attiva il programma **Booking.com** dentro la dashboard.
- [ ] Copia il tuo **marker** (è l'ID affiliato, un numero tipo `123456`).

> Nota: nel codice ho usato per Booking.com `p=4115` e `campaign_id=101`.
> Verifica nella tua dashboard che siano questi gli ID del deep-link Booking.
> Se diversi, dimmelo e li aggiorno in `app/_lib/affiliate-link.ts`.

## 2. Configura il marker

In locale:

- [ ] Copia `.env.example` in `.env.local`
- [ ] Incolla il marker:

```
NEXT_PUBLIC_TRAVELPAYOUTS_MARKER=123456
```

In produzione (Vercel/host):

- [ ] Aggiungi la stessa env var `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` nelle
      Environment Variables del progetto.
- [ ] Ridistribuisci (la var è `NEXT_PUBLIC_`, viene inlined al build → serve
      un nuovo deploy dopo averla impostata).

## 3. Verifica veloce

- [ ] `pnpm dev`, calcola un piano, su un ponte clicca **"Prenota questi
      giorni"**.
- [ ] Controlla che l'URL aperto sia `tp.media/r?...` e che porti a Booking con
      `checkin`/`checkout` giusti.
- [ ] Senza marker il link funziona ma non traccia la commissione → il marker
      in prod è obbligatorio.

## 4. Legale

- [ ] Rileggi `app/privacy/page.tsx` sezione **"Link di affiliazione"** e dì se
      vuoi cambiare il testo.
- [ ] Verifica che le condizioni Travelpayouts/Booking non richiedano una
      dicitura specifica in più (di solito basta "link affiliato").

## 5. Commit / PR

- [ ] Il lavoro non è ancora committato. Quando vuoi: dimmi e creo il commit
      sul branch attuale.

## Fatto da me (non devi toccarlo)

- Deep-link builder puro + test (`app/_lib/affiliate-link.ts` + `.test.ts`).
- CTA per ponte (card mobile + colonna tabella) in `results-table.tsx`.
- Riga disclosure affiliato sotto i risultati.
- Sezione privacy affiliazione + apertura allargata.
- `.env.example` con la var.
- Niente Google Analytics, niente ads, niente cookie banner, nessun cookie
  nostro.
