import type { Metadata } from "next";
import Link from "next/link";
import styles from "../styles/app.module.scss";

export const metadata: Metadata = {
  title: "Privacy policy | CalcolaFerie",
  description:
    "Informativa privacy minimale di CalcolaFerie: newsletter e link di affiliazione.",
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
            Questa informativa copre i due soli punti in cui CalcolaFerie tocca dati o servizi
            esterni: la newsletter (aggiornamenti sul prodotto e un promemoria annuale quando sono
            pronti il nuovo calendario e i dati sulle festivita) e i link di affiliazione per
            prenotare i giorni dei ponti. Il calcolo dei ponti avviene nel tuo browser e non ci
            invia alcun dato.
          </p>
        </header>

        <section>
          <h2>Dati raccolti</h2>
          <p>
            Quando ti iscrivi alla newsletter raccogliamo il tuo indirizzo email. Buttondown, il
            provider usato per gestire la newsletter, puo registrare anche il momento
            dell'iscrizione, i metadati tecnici del provider e i dati tecnici normalmente necessari
            per inviare email e gestire la lista.
          </p>
        </section>

        <section>
          <h2>Perche li usiamo</h2>
          <p>
            Usiamo questi dati per inviarti aggiornamenti su CalcolaFerie e, manualmente, un
            promemoria annuale quando il calendario delle festivita viene aggiornato. Non usiamo
            questi dati per creare un account, vendere contatti o alimentare un CRM separato.
          </p>
        </section>

        <section>
          <h2>Base giuridica</h2>
          <p>
            L'iscrizione si basa sul tuo consenso esplicito: invii l'email solo dopo aver accettato
            il trattamento dei dati dal form di iscrizione.
          </p>
        </section>

        <section>
          <h2>Provider newsletter</h2>
          <p>
            La lista email e gestita da Buttondown. Buttondown gestisce l'archiviazione degli
            iscritti, la conferma dell'iscrizione, l'invio delle email e i link di disiscrizione.
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
          <h2>Disiscrizione</h2>
          <p>
            Puoi disiscriverti in qualsiasi momento usando il link di unsubscribe presente in ogni
            email della newsletter.
          </p>
        </section>

        <section>
          <h2>Richieste privacy</h2>
          <p>
            Per richieste sui dati o sulla privacy, contatta il maintainer del progetto dal profilo
            GitHub{" "}
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
