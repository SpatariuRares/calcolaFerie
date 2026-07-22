import Link from "next/link";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import { LanguageSwitcher } from "../language-switcher";

const FOOTER_MANAGER = process.env.NEXT_PUBLIC_GESTORE ?? "Spatariu Rares";
const FOOTER_EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "privacy@calcolaferie.it";

export function SiteFooter() {
  const t = useAppTranslations("footer");
  const piva = process.env.NEXT_PUBLIC_PIVA;

  return (
    <footer className={styles.pageFooter}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <p className={styles.footerName}>CalcolaFerie</p>
          <p className={styles.footerTagline}>{t("tagline")}</p>
        </div>
        <div className={styles.footerCol}>
          <p className={styles.footerHeading}>{t("contacts")}</p>
          <a href={`mailto:${FOOTER_EMAIL}`}>{FOOTER_EMAIL}</a>
          <span>{t("manager", { name: FOOTER_MANAGER })}</span>
          {piva ? <span>{t("vat", { value: piva })}</span> : null}
        </div>

        <div className={styles.footerCol}>
          <p className={styles.footerHeading}>{t("legal")}</p>
          <Link href="/privacy">{t("privacy")}</Link>
          <LanguageSwitcher />
        </div>
      </div>
      <p className={styles.footerBottom}>{t("copyright", { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
