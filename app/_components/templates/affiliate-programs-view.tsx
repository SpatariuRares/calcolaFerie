"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AFFILIATE_PROGRAMS } from "../../_lib/affiliate-constants";
import styles from "../../styles/app.module.scss";

export function AffiliateProgramsView() {
  const t = useTranslations("affiliates");
  const tPrivacy = useTranslations("privacy");

  return (
    <main className={styles.pageShell}>
      <article className={styles.privacyPage} aria-labelledby="affiliates-title">
        <Link className={styles.backLink} href="/">
          {tPrivacy("back")}
        </Link>
        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="affiliates-title">{t("title")}</h1>
          <p>{t("intro")}</p>
        </header>
        <section>
          <h2>{t("list.title")}</h2>
          <div className={styles.affiliateGrid}>
            {AFFILIATE_PROGRAMS.filter((program) => program.status === "active").map(
              (program) => (
                <div className={styles.affiliateCard} key={program.key}>
                  <div className={styles.affiliateCardHead}>
                    <p className={styles.affiliateCardTitle}>
                      {t(`programs.${program.key}.name`)}
                    </p>
                  </div>
                  <p>{t(`programs.${program.key}.description`)}</p>
                </div>
              )
            )}
          </div>
        </section>
        <section>
          <h2>{t("disclosure.title")}</h2>
          <p>{t("disclosure.body")}</p>
        </section>
      </article>
    </main>
  );
}
