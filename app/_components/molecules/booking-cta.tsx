import type { BridgeOpportunity } from "@engine";
import { buildBookingDeepLink } from "../../_lib/affiliate-link";
import styles from "../../styles/app.module.scss";

export function BookingCta({ opportunity }: { opportunity: BridgeOpportunity }) {
  const href = buildBookingDeepLink({
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
  });

  // Stop propagation so booking does not toggle the row/card selection.
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <span className={styles.bookingCtaWrap}>
      <span className={styles.affiliateLabel}>Link affiliato</span>
      <a
        className={styles.bookingCta}
        href={href}
        onClick={stop}
        onKeyDown={stop}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        Prenota questi giorni
      </a>
    </span>
  );
}
