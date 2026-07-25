"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "../../styles/app.module.scss";

type ProgramStatus = "active" | "planned";

interface AffiliateProgram {
  key: string;
  status: ProgramStatus;
}

const PROGRAMS: AffiliateProgram[] = [
  { key: "booking", status: "active" },
  { key: "saily", status: "active" },
  { key: "aviasales", status: "planned" },
  { key: "hotellook", status: "planned" },
  { key: "getyourguide", status: "planned" },
  { key: "discovercars", status: "planned" },
  { key: "insurance", status: "planned" },
];

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
            {PROGRAMS.map((program) => (
              <div className={styles.affiliateCard} key={program.key}>
                <div className={styles.affiliateCardHead}>
                  <p className={styles.affiliateCardTitle}>{t(`programs.${program.key}.name`)}</p>
                  <span
                    className={`${styles.affiliateBadge} ${
                      program.status === "active"
                        ? styles.affiliateBadgeActive
                        : styles.affiliateBadgePlanned
                    }`}
                  >
                    {t(`status.${program.status}`)}
                  </span>
                </div>
                <p>{t(`programs.${program.key}.description`)}</p>
              </div>
            ))}
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
