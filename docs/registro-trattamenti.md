# Registro dei trattamenti

Bozza tecnica per CalcolaFerie, preparata per accountability GDPR. Non e un
parere legale e va verificata dal gestore prima del lancio.

Riferimenti principali: GDPR artt. 5, 6, 7, 28, 30, 32, 44-46. L'art. 30 GDPR
richiede, dove applicabile, un registro scritto con titolare, finalita,
categorie di interessati e dati, destinatari, trasferimenti extra-SEE,
conservazione e misure di sicurezza generali.

## Dati generali

| Campo | Valore |
| --- | --- |
| Titolare del trattamento | TODO: confermare nome/denominazione del titolare da usare nei documenti legali. |
| Contatto privacy | `privacy@calcolaferie.it` - TODO: creare e verificare la casella prima del lancio. |
| DPO | Non nominato nel repo. TODO: confermare che non sia richiesto per il caso concreto. |
| Responsabile interno | TODO: indicare chi mantiene questo registro e la data di revisione periodica. |
| Ultimo aggiornamento | 2026-07-09 |

## Newsletter

| Campo | Valore |
| --- | --- |
| Finalita | Invio di aggiornamenti su CalcolaFerie e promemoria annuale quando sono disponibili calendario e dati aggiornati. |
| Base giuridica | Consenso dell'interessato, GDPR art. 6(1)(a) e art. 7. |
| Interessati | Utenti che compilano il form newsletter e prestano consenso. |
| Categorie di dati | Indirizzo email; timestamp e metadati tecnici registrati dal provider; stato di conferma double opt-in. |
| Origine dei dati | Form newsletter del sito. |
| Destinatari / responsabili | Buttondown come provider newsletter. TODO: archiviare DPA/accordo ex art. 28 GDPR. |
| Trasferimenti extra-SEE | Possibili trasferimenti verso USA tramite Buttondown. TODO: verificare certificazione EU-US Data Privacy Framework e mantenere SCC come fallback documentato, se applicabile. |
| Conservazione | Finche l'utente resta iscritto o finche serve a gestire lista, prova del consenso, unsubscribe e contestazioni. TODO: confermare il periodo massimo con il provider. |
| Misure di sicurezza | API key server-only; consenso validato lato server; subscriber creato come `type: "unactivated"` per double opt-in; accesso account provider da limitare agli autorizzati. TODO: definire MFA e ruoli account Buttondown. |

## Statistiche di visita

| Campo | Valore |
| --- | --- |
| Finalita | Misurare traffico e pagine visitate in forma aggregata per migliorare il servizio. |
| Base giuridica | Legittimo interesse, GDPR art. 6(1)(f), con minimizzazione dei dati e senza cookie impostati dal sito. TODO: conservare una valutazione di bilanciamento LIA se richiesta. |
| Interessati | Visitatori del sito. |
| Categorie di dati | Dati tecnici necessari al servizio analytics di hosting; metriche aggregate; URL senza query string per evitare invio di parametri del planner. |
| Origine dei dati | Visite alle pagine del sito. |
| Destinatari / responsabili | Vercel per hosting e Web Analytics. TODO: archiviare DPA/accordo ex art. 28 GDPR. |
| Trasferimenti extra-SEE | Possibili trasferimenti verso USA tramite Vercel. TODO: verificare certificazione EU-US Data Privacy Framework e mantenere SCC come fallback documentato, se applicabile. |
| Conservazione | Sessioni di visita scartate dopo 24 ore secondo l'informativa attuale; metriche aggregate disponibili nella dashboard. TODO: verificare il periodo effettivo nel piano Vercel usato. |
| Misure di sicurezza | Nessun Google Analytics; nessun cookie banner per lo stack attuale; rimozione query string prima dell'invio ad Analytics; accesso dashboard da limitare agli autorizzati. TODO: definire MFA e ruoli account Vercel. |

## Affiliazione

| Campo | Valore |
| --- | --- |
| Finalita | Sostenere il progetto tramite link affiliati trasparenti verso prenotazioni correlate ai ponti suggeriti. |
| Base giuridica | Legittimo interesse, GDPR art. 6(1)(f), e trasparenza verso l'utente sulla natura affiliata del link. TODO: verificare wording richiesto dal network affiliato. |
| Interessati | Utenti che cliccano una CTA di prenotazione. |
| Categorie di dati | Dal sito vengono passate solo date di check-in/check-out nel deep-link; nessuna destinazione e nessun cookie impostato da CalcolaFerie. Dopo il click, provider esterni possono trattare dati secondo le loro informative. |
| Origine dei dati | Click volontario sulla CTA di prenotazione e date dell'opportunita selezionata. |
| Destinatari / responsabili | Travelpayouts e provider di prenotazione finale, oggi configurato verso Booking.com. TODO: verificare ruoli privacy, termini e documenti contrattuali applicabili. |
| Trasferimenti extra-SEE | Possibili trasferimenti tramite network affiliato e provider di prenotazione. TODO: verificare paesi, DPF/SCC o altre garanzie applicabili nei documenti dei provider. |
| Conservazione | CalcolaFerie non conserva click affiliati in un database proprio; eventuali log o report commissioni sono gestiti dai provider. TODO: verificare tempi di conservazione nella dashboard/contratto Travelpayouts e del provider finale. |
| Misure di sicurezza | Link marcati come affiliati e `rel="sponsored"`; marker affiliato pubblico in env var `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER`; nessun cookie impostato dal dominio del sito. TODO: limitare accesso agli account affiliati e archiviare i termini accettati. |

## TODO trasversali

- [ ] Confermare dati esatti del titolare da usare in privacy policy, footer e registro.
- [ ] Creare e testare la casella `privacy@calcolaferie.it`.
- [ ] Archiviare DPA/accordi ex art. 28 per Buttondown e Vercel.
- [ ] Verificare certificazioni EU-US Data Privacy Framework e fallback SCC per provider USA.
- [ ] Definire chi aggiorna il registro e con quale cadenza.
