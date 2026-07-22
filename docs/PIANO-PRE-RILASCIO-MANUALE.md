# Piano pre-rilascio - Parte manuale

Attivita che richiedono account, identita, decisioni o verifiche reali del gestore. L'AI puo assistere, ma non puo dichiararle completate senza evidenza.

## P0 - Bloccanti

### Gestore e fiscalita

- [ ] Confermare nome o denominazione del gestore.
- [ ] Chiedere al commercialista se l'affiliazione e occasionale o abituale.
- [ ] Confermare P.IVA e adempimenti.
- [ ] Fornire dati pubblici per footer e privacy.
- [ ] Definire gestione dei ricavi affiliati.

### Dominio e contatto privacy

- [ ] Registrare `calcolaferie.it`.
- [ ] Configurare DNS, TLS e dominio canonico.
- [ ] Creare e testare `privacy@calcolaferie.it`.
- [ ] Definire responsabile e frequenza di controllo.

### Vercel

- [ ] Confermare progetto e team.
- [ ] Configurare produzione e preview.
- [ ] Definire la politica dei deploy automatici.
- [ ] Creare token con privilegi minimi.
- [ ] Configurare secret GitHub e `NEXT_PUBLIC_BASE_URL`.
- [ ] Abilitare MFA.

### Buttondown

- [ ] Creare account e abilitare MFA.
- [ ] Configurare `BUTTONDOWN_API_KEY` solo in Vercel.
- [ ] Verificare double opt-in reale.
- [ ] Verificare timestamp e unsubscribe.
- [ ] Definire mittente, contenuti e frequenza.

### Travelpayouts

- [ ] Creare account e attivare Booking.com.
- [ ] Configurare il marker.
- [ ] Verificare ID programma e campagna.
- [ ] Provare link e attribuzione click.
- [ ] Verificare wording e conservare i termini.

### Privacy e contratti

- [ ] Confermare il titolare (GDPR artt. 4 e 13).
- [ ] Archiviare DPA Vercel e Buttondown (art. 28).
- [ ] Identificare ruoli di Travelpayouts e Booking.com.
- [ ] Verificare sub-responsabili e paesi.
- [ ] Verificare DPF/SCC applicabili (artt. 45-46).
- [ ] Confermare retention (art. 5).
- [ ] Aggiornare privacy policy e registro.
- [ ] Eliminare i TODO legali bloccanti.

### Procedure organizzative

- [ ] Definire gestione dei diritti privacy (artt. 12, 15-21).
- [ ] Preparare cancellazione dai provider.
- [ ] Preparare procedura data breach (artt. 33-34).
- [ ] Definire accessi e abilitare MFA.
- [ ] Aggiornare il registro trattamenti (art. 30).

### Variabili di produzione

- [ ] Configurare base URL, marker, Buttondown e P.IVA se applicabile.
- [ ] Verificare ambienti Production e Preview.
- [ ] Definire rotazione dei segreti.
- [ ] Revocare chiavi di prova.

### Collaudo preview

- [ ] Provare calcolo, risultati, calendario e budget.
- [ ] Verificare persistenza e URL anonimo.
- [ ] Provare newsletter, unsubscribe e affiliazione.
- [ ] Confermare Analytics senza query string.
- [ ] Testare desktop, iOS, Android e modalita privata.
- [ ] Rileggere testi legali e disclosure.
- [ ] Verificare Open Graph, sitemap e robots.

## P1 - Operativita

- [ ] Scegliere uptime monitoring e alert.
- [ ] Definire responsabile incidenti.
- [ ] Preparare risposte privacy/newsletter.
- [ ] Conservare accessi in un password manager.
- [ ] Definire chi puo fare rollback.

## Decisione go/no-go

- [ ] Parte AI completata con test verdi.
- [ ] Dominio, TLS e variabili pronti.
- [ ] Newsletter e affiliazione verificate.
- [ ] Identita, privacy e fiscalita definite.
- [ ] DPA e trasferimenti documentati.
- [ ] Documenti senza placeholder.
- [ ] Rollback definito.
- [ ] Preview approvata.

- [ ] **GO - autorizzo il rilascio.**
- [ ] **NO-GO - il rilascio resta bloccato.**

| Campo           | Valore |
| --------------- | ------ |
| Data            |        |
| Versione/commit |        |
| Responsabile    |        |
| Note            |        |

## Dopo il deploy

- [ ] Entro 15 minuti: verificare sito, TLS, calcolo, newsletter, affiliazione, log e SEO.
- [ ] Entro 24 ore: verificare uptime, conferme, click e Search Console.
- [ ] Decidere mantenimento o rollback.

## Registro evidenze

| Attivita          | Evidenza | Data | Responsabile | Esito |
| ----------------- | -------- | ---- | ------------ | ----- |
| Dominio/TLS       |          |      |              |       |
| Email privacy     |          |      |              |       |
| Buttondown        |          |      |              |       |
| Travelpayouts     |          |      |              |       |
| DPA/trasferimenti |          |      |              |       |
| Posizione fiscale |          |      |              |       |
| Collaudo preview  |          |      |              |       |
| Autorizzazione GO |          |      |              |       |

> Checklist informativa: non sostituisce consulenza legale o fiscale.
