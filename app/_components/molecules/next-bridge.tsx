"use client";

import { useSyncExternalStore } from "react";
import { isoToDate, type ISODateString } from "@engine";
import { getNextBridge } from "@lib/next-bridge";
import { useAppLocale, useAppTranslations } from "@lib/use-app-i18n";
import { BookingCta } from "./booking-cta";
import styles from "./next-bridge.module.scss";

// Le date dell'engine sono mezzanotte UTC: formatto in UTC per evitare
// sfasamenti di un giorno rispetto al fuso locale.
function formatRange(startIso: string, endIso: string, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "it-IT", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const start = isoToDate(startIso as ISODateString);
  const end = isoToDate(endIso as ISODateString);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Widget "prossimo ponte": calcola lato client il primo ponte utile e lo mostra
 * con countdown e CTA al calcolatore. Renderizza solo dopo il mount per evitare
 * disallineamenti di hydration dovuti al fuso orario del server.
 */
export function NextBridge() {
  const t = useAppTranslations("nextBridge");
  const tHolidays = useAppTranslations("holidays");
  const locale = useAppLocale();

  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
  const data = isClient ? getNextBridge() : null;

  if (!data) return null;

  const { opportunity, holidayKey, daysUntilStart } = data;
  const label = tHolidays(holidayKey as never);
  const countdown =
    daysUntilStart === 0 ? t("ongoing") : t("countdown", { days: daysUntilStart });

  return (
    <section className={styles.card} aria-labelledby="next-bridge-title">
      <div className={styles.info}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id="next-bridge-title" className={styles.title}>
          {label}
        </h2>
        <p className={styles.range}>
          {formatRange(opportunity.startDate, opportunity.endDate, locale)}
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span className={styles.countdown}>{countdown}</span>
        </p>
      </div>

      <div className={styles.aside}>
        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dd className={styles.statValue}>{opportunity.staccoDays}</dd>
            <dt className={styles.statLabel}>{t("stacco")}</dt>
          </div>
          <div className={styles.stat}>
            <dd className={styles.statValue}>{opportunity.costDays}</dd>
            <dt className={styles.statLabel}>{t("ferie")}</dt>
          </div>
          <div className={`${styles.stat} ${styles.statAccent}`}>
            <dd className={styles.statValue}>{opportunity.leva.toFixed(1)}x</dd>
            <dt className={styles.statLabel}>{t("leva")}</dt>
          </div>
        </dl>
        <BookingCta />
      </div>
    </section>
  );
}
