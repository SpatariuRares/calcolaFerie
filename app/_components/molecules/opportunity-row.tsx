import type { BridgeOpportunity } from "@engine";
import { formatDateRange } from "../../_lib/opportunity-display";
import { useAppLocale, useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import { BookingCta } from "./booking-cta";
import { LevaBadge } from "./leva-badge";

export function OpportunityRow({
  opportunity,
  isSelected,
  onToggleOpportunity,
}: {
  opportunity: BridgeOpportunity;
  isSelected: boolean;
  onToggleOpportunity: (opportunityId: string) => void;
}) {
  const t = useAppTranslations("results");
  const locale = useAppLocale();
  const dateRange = formatDateRange(opportunity.startDate, opportunity.endDate, locale);

  return (
    <tr
      aria-label={t("bridgeAria", { action: t(isSelected ? "deselect" : "select"), dateRange })}
      aria-pressed={isSelected}
      className={isSelected ? styles.selectedTableRow : undefined}
      onClick={() => onToggleOpportunity(opportunity.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleOpportunity(opportunity.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <td>
        <input
          aria-label={t("selectBridgeAria", { dateRange })}
          checked={isSelected}
          onChange={() => onToggleOpportunity(opportunity.id)}
          onClick={(event) => event.stopPropagation()}
          type="checkbox"
        />
      </td>
      <th scope="row">{dateRange}</th>
      <td>{opportunity.staccoDays}</td>
      <td>{opportunity.costDays}</td>
      <td>
        <LevaBadge leva={opportunity.leva} />
      </td>
      <td className={styles.bookingCell} onClick={(event) => event.stopPropagation()}>
        <BookingCta />
      </td>
    </tr>
  );
}
