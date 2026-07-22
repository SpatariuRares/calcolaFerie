import styles from "../../styles/app.module.scss";

export function SiteHeader() {
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <div>
        <p className={styles.eyebrow}>Planner ferie</p>
        <h1 id="page-title">CalcolaFerie</h1>
      </div>
      <p>
        Trova i ponti migliori nei prossimi 12 mesi, distinguendo ferie da spendere, chiusure
        aziendali e giorni obbligatori.
      </p>
    </section>
  );
}
