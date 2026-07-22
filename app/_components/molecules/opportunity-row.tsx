import type { BridgeOpportunity } from "@engine";
import { formatDateRange, formatExplanation } from "../../_lib/opportunity-display";
import styles from "../../styles/app.module.scss";
import { BookingCta } from "./booking-cta";
import { LevaBadge } from "./leva-badge";

export function OpportunityRow({
  opportunity,
  availableBudget,
  isSelected,
  onToggleOpportunity,
}: {
  opportunity: BridgeOpportunity;
  availableBudget: number;
  isSelected: boolean;
  onToggleOpportunity: (opportunityId: string) => void;
}) {
  const isOverBudget = opportunity.costDays > availableBudget;
  const dateRange = formatDateRange(opportunity.startDate, opportunity.endDate);

  return (
    <tr
      aria-label={`${isSelected ? "Deseleziona" : "Seleziona"} ponte ${dateRange}`}
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
          aria-label={`Seleziona ponte ${dateRange}`}
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
      <td>{formatExplanation(opportunity)}</td>
      <td>
        {isSelected ? <span className={styles.selectedChip}>Scalato</span> : null}
        {isOverBudget ? <span className={styles.budgetChip}>Fuori budget</span> : null}
      </td>
      <td className={styles.bookingCell} onClick={(event) => event.stopPropagation()}>
        <BookingCta opportunity={opportunity} />
      </td>
    </tr>
  );
}
