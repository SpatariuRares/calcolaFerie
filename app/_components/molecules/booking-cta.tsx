import type { BridgeOpportunity } from "@engine";
import { buildBookingDeepLink, buildLastminuteDeepLink } from "../../_lib/affiliate-link";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export function BookingCta({
  endDate,
  startDate,
}: Pick<BridgeOpportunity, "endDate" | "startDate">) {
  const t = useAppTranslations("results");
  const bookingHref = buildBookingDeepLink({
    startDate,
    endDate,
  });
  const flightsHref = buildLastminuteDeepLink({
    startDate,
    endDate,
  });

  // Stop propagation so booking does not toggle the row/card selection.
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <span className={styles.bookingCtaWrap}>
      <span className={styles.affiliateLabel}>{t("affiliateLabel")}</span>
      <a
        className={styles.bookingCta}
        href={bookingHref}
        onClick={stop}
        onKeyDown={stop}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        {t("bookCta")}
      </a>
      <a
        className={styles.bookingCta}
        href={flightsHref}
        onClick={stop}
        onKeyDown={stop}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        {t("flightsCta")}
      </a>
    </span>
  );
}
