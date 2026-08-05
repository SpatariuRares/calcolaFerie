"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaqJsonLd } from "@components/atoms/json-ld";
import { PageChrome } from "@components/organisms/page-chrome";
import styles from "@styles/app.module.scss";

export function FaqView() {
  const t = useTranslations("home.faq");
  const tPrivacy = useTranslations("privacy");

  return (
    <PageChrome>
      <FaqJsonLd />
      <article aria-labelledby="faq-title" className={styles.faqPage}>
        <Link className={styles.backLink} href="/">
          {tPrivacy("back")}
        </Link>
        <section aria-labelledby="faq-title" className={styles.seoFaqSection}>
          <div className={styles.seoFaqInner}>
            <h1 id="faq-title" className={styles.seoFaqTitle}>
              {t("title")}
            </h1>
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
      </article>
    </PageChrome>
  );
}
