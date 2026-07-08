import type { Metadata } from "next";
import Link from "next/link";
import styles from "../styles/app.module.scss";

export const metadata: Metadata = {
  title: "Privacy policy | CalcolaFerie",
  description:
    "Informativa privacy minimale di CalcolaFerie: newsletter, analytics e link di affiliazione.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.pageShell}>
      <article className={styles.privacyPage} aria-labelledby="privacy-title">
        <Link className={styles.backLink} href="/">
          Torna al planner
        </Link>

        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>Privacy</p>
          <h1 id="privacy-title">Privacy policy</h1>
          <p>
            Questa informativa copre i soli punti in cui CalcolaFerie tocca dati o servizi esterni:
            la newsletter (aggiornamenti sul prodotto e un promemoria annuale quando sono pronti il
            nuovo calendario e i dati sulle festivita), le statistiche aggregate di visita e i link
            di affiliazione per prenotare i giorni dei ponti. Il calcolo dei ponti avviene nel tuo
            browser e non ci invia alcun dato.
          </p>
        </header>

        <section>
          <h2>Titolare e contatto</h2>
          <p>
            Il titolare del trattamento e il maintainer di CalcolaFerie, Spatariu Rares. Per
            richieste privacy puoi scrivere a{" "}
            <a href="mailto:privacy@calcolaferie.it">privacy@calcolaferie.it</a>. Il profilo GitHub
            resta un canale aggiuntivo:{" "}
            <a href="https://github.com/SpatariuRares" rel="noreferrer" target="_blank">
              SpatariuRares
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Dati raccolti</h2>
          <p>
            Quando ti iscrivi alla newsletter raccogliamo il tuo indirizzo email. Buttondown, il
            provider usato per gestire la newsletter, puo registrare anche il momento
            dell'iscrizione, i metadati tecnici del provider e i dati tecnici normalmente necessari
            per inviare email e gestire la lista.
          </p>
          <p>
            Per le statistiche di visita riceviamo solo dati aggregati da Vercel Web Analytics. Il
            calcolo dei ponti, il budget ferie, le date selezionate e le festivita inserite restano
            nel browser; prima dell'invio ad Analytics rimuoviamo i parametri dall'URL.
          </p>
          <p>
            Quando chiedi di salvare le impostazioni, usiamo il localStorage del browser con la
            chiave <code>calcolaferie_config</code>. Contiene budget ferie, date di chiusura o ferie
            obbligatorie, patrono e date di ferie selezionate. Questa e memorizzazione tecnica
            richiesta dall'utente per ricordare la configurazione del planner, esente da consenso ai
            sensi dell'art. 5(3) della direttiva ePrivacy.
          </p>
        </section>

        <section>
          <h2>Finalita e basi giuridiche</h2>
          <p>
            Usiamo l'email della newsletter solo per inviarti aggiornamenti su CalcolaFerie e un
            promemoria annuale quando il calendario delle festivita viene aggiornato. La base
            giuridica e il tuo consenso esplicito, che puoi ritirare in qualsiasi momento.
          </p>
          <p>
            Usiamo statistiche aggregate di visita per capire quali pagine funzionano e migliorare
            il servizio. La base giuridica e il legittimo interesse a misurare l'uso del sito con
            dati minimizzati, senza cookie di terze parti e senza query string.
          </p>
          <p>
            I link di affiliazione servono a sostenere il progetto. La base giuridica e il legittimo
            interesse a monetizzare il servizio in modo trasparente; il click ti porta su servizi
            esterni che trattano i dati secondo le rispettive informative.
          </p>
        </section>

        <section>
          <h2>Destinatari e provider</h2>
          <p>
            Usiamo Buttondown per gestire la newsletter, Vercel per hosting e Web Analytics, e
            Travelpayouts o il provider di prenotazione quando clicchi un link di affiliazione. Non
            vendiamo dati personali a terzi.
          </p>
        </section>

        <section>
          <h2>Trasferimenti fuori SEE</h2>
          <p>
            Alcuni provider possono trattare dati fuori dallo Spazio Economico Europeo. Dove
            necessario, il trasferimento deve basarsi sull'EU–US Data Privacy Framework (o Standard
            Contractual Clauses come garanzia alternativa).
          </p>
        </section>

        <section>
          <h2>Statistiche di visita</h2>
          <p>
            Usiamo Vercel Web Analytics per capire, in forma aggregata, quali pagine vengono
            visitate e migliorare il servizio. Vercel Analytics non usa cookie di terze parti:
            identifica le visite tramite un hash della richiesta e scarta automaticamente le
            sessioni dopo 24 ore. Prima dell'invio rimuoviamo i parametri dall'URL, cosi i link
            condivisibili con budget o date non vengono trasmessi nelle statistiche.
          </p>
        </section>

        <section>
          <h2>Link di affiliazione</h2>
          <p>
            Accanto a ogni ponte trovi un link per prenotare i giorni suggeriti. Sono link di
            affiliazione: se prenoti tramite questi link riceviamo una piccola commissione, senza
            costi extra per te. I link passano solo le date del ponte, nessuna destinazione, e ti
            portano alla ricerca del provider tramite Travelpayouts.
          </p>
          <p>
            Noi non impostiamo cookie di tracciamento dal nostro dominio e non aggiungiamo
            pubblicita, banner dei cookie o Google Analytics. Dopo che hai cliccato un link, il
            provider di prenotazione puo impostare i propri cookie sul suo dominio, secondo la sua
            informativa privacy.
          </p>
        </section>

        <section>
          <h2>Conservazione</h2>
          <p>
            Conserviamo l'email della newsletter finche resti iscritto o finche serve a gestire la
            lista. Vercel Web Analytics conserva le sessioni di visita per 24 ore e mostra metriche
            aggregate. I dati locali del planner restano nel tuo browser finche non li cancelli dal
            browser o modifichi le impostazioni salvate.
          </p>
        </section>

        <section>
          <h2>I tuoi diritti</h2>
          <p>
            Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilita dei dati,
            opposizione al trattamento basato su legittimo interesse e ritiro del consenso alla
            newsletter. Rispondiamo di norma entro un mese. Puoi anche presentare reclamo al Garante
            per la protezione dei dati personali o all'autorita competente del tuo paese UE.
          </p>
        </section>

        <section>
          <h2>Disiscrizione</h2>
          <p>
            Puoi disiscriverti in qualsiasi momento usando il link di unsubscribe presente in ogni
            email della newsletter.
          </p>
        </section>

        <section>
          <h2>Richieste privacy</h2>
          <p>
            Per richieste sui dati o sulla privacy, scrivi a{" "}
            <a href="mailto:privacy@calcolaferie.it">privacy@calcolaferie.it</a>. Puoi anche
            contattare il maintainer dal profilo GitHub{" "}
            <a href="https://github.com/SpatariuRares" rel="noreferrer" target="_blank">
              SpatariuRares
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
