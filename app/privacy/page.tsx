"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "../styles/app.module.scss";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "privacy@calcolaferie.it";

export default function PrivacyPage() {
  const t = useTranslations("privacy");
  const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  const github = (
    <a href="https://github.com/SpatariuRares" rel="noreferrer" target="_blank">
      SpatariuRares
    </a>
  );

  return (
    <main className={styles.pageShell}>
      <article className={styles.privacyPage} aria-labelledby="privacy-title">
        <Link className={styles.backLink} href="/">
          {t("back")}
        </Link>
        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="privacy-title">{t("title")}</h1>
          <p>{t("intro")}</p>
        </header>
        <section>
          <h2>{t("controller.title")}</h2>
          <p>{t.rich("controller.body", { email: () => email, github: () => github })}</p>
        </section>
        <section>
          <h2>{t("data.title")}</h2>
          <p>{t("data.newsletter")}</p>
          <p>{t("data.analytics")}</p>
          <p>{t("data.storage")}</p>
        </section>
        <section>
          <h2>{t("purposes.title")}</h2>
          <p>{t("purposes.newsletter")}</p>
          <p>{t("purposes.analytics")}</p>
          <p>{t("purposes.affiliate")}</p>
        </section>
        <section>
          <h2>{t("recipients.title")}</h2>
          <p>{t("recipients.body")}</p>
        </section>
        <section>
          <h2>{t("transfers.title")}</h2>
          <p>{t("transfers.body")}</p>
        </section>
        <section>
          <h2>{t("analytics.title")}</h2>
          <p>{t("analytics.body")}</p>
        </section>
        <section>
          <h2>{t("affiliate.title")}</h2>
          <p>{t("affiliate.links")}</p>
          <p>{t("affiliate.cookies")}</p>
        </section>
        <section>
          <h2>{t("retention.title")}</h2>
          <p>{t("retention.body")}</p>
        </section>
        <section>
          <h2>{t("rights.title")}</h2>
          <p>{t("rights.body")}</p>
        </section>
        <section>
          <h2>{t("unsubscribe.title")}</h2>
          <p>{t("unsubscribe.body")}</p>
        </section>
        <section>
          <h2>{t("requests.title")}</h2>
          <p>{t.rich("requests.body", { email: () => email, github: () => github })}</p>
        </section>
      </article>
    </main>
  );
}
