import type { BridgeOpportunity } from "@engine";
import { buildBookingDeepLink } from "../../_lib/affiliate-link";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export function BookingCta({
  endDate,
  startDate,
}: Pick<BridgeOpportunity, "endDate" | "startDate">) {
  const t = useAppTranslations("results");
  const href = buildBookingDeepLink({
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
        href={href}
        onClick={stop}
        onKeyDown={stop}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        {t("bookCta")}
      </a>
    </span>
  );
}
