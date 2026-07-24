import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export function SeoFaq() {
  const t = useAppTranslations("home.faq");

  return (
    <section aria-labelledby="faq-title" className={styles.seoFaqSection}>
      <div className={styles.seoFaqInner}>
        <h2 id="faq-title" className={styles.seoFaqTitle}>
          {t("title")}
        </h2>
        <p className={styles.seoFaqSubtitle}>{t("subtitle")}</p>

        <div className={styles.seoFaqList}>
          <details className={styles.seoFaqItem} open>
            <summary className={styles.seoFaqQuestion}>{t("q1")}</summary>
            <p className={styles.seoFaqAnswer}>{t("a1")}</p>
          </details>

          <details className={styles.seoFaqItem}>
            <summary className={styles.seoFaqQuestion}>{t("q2")}</summary>
            <p className={styles.seoFaqAnswer}>{t("a2")}</p>
          </details>

          <details className={styles.seoFaqItem}>
            <summary className={styles.seoFaqQuestion}>{t("q3")}</summary>
            <p className={styles.seoFaqAnswer}>{t("a3")}</p>
          </details>
        </div>
      </div>
    </section>
  );
}
