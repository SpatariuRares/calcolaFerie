import Link from "next/link";
import styles from "../../styles/app.module.scss";

const CONTACT_EMAIL = "privacy@calcolaferie.it";
const OWNER_NAME = "Spatariu Rares";

export function SiteFooter() {
  const piva = process.env.NEXT_PUBLIC_PIVA;

  return (
    <footer className={styles.pageFooter}>
      <div className={styles.footerInner}>
        <address className={styles.footerContact}>
          <span className={styles.footerLine}>Gestore: {OWNER_NAME}</span>
          <span className={styles.footerLine}>
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </span>
          {piva ? <span className={styles.footerLine}>P.IVA: {piva}</span> : null}
        </address>

        <nav aria-label="Link legali" className={styles.footerNav}>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
