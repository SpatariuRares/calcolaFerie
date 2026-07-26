"use client";

import Link from "next/link";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export function SiteNav() {
  const t = useAppTranslations("footer");

  return (
    <nav aria-label="Principale" className={styles.siteNav}>
      <div className={styles.siteNavInner}>
        <Link className={styles.siteNavBrand} href="/">
          CalcolaFerie
        </Link>
        <div className={styles.siteNavLinks}>
          <Link href="/blog">{t("blog")}</Link>
          <Link href="/affiliazioni">{t("affiliates")}</Link>
        </div>
      </div>
    </nav>
  );
}
