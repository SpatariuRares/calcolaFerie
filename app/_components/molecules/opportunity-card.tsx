import type { BridgeOpportunity } from "@engine";
import { formatDateRange, formatExplanation } from "../../_lib/opportunity-display";
import styles from "../../styles/app.module.scss";
import { BookingCta } from "./booking-cta";
import { LevaBadge } from "./leva-badge";

export function OpportunityCard({
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

  return (
    <article
      aria-pressed={isSelected}
      className={`${styles.opportunityCard}${isSelected ? ` ${styles.opportunitySelected}` : ""}`}
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
      <div className={styles.opportunityCardHeader}>
        <span className={styles.opportunitySelector}>
          <span aria-hidden="true" className={styles.selectionBox}>
            {isSelected ? "✓" : ""}
          </span>
          <span>{formatDateRange(opportunity.startDate, opportunity.endDate)}</span>
        </span>
        <LevaBadge leva={opportunity.leva} />
      </div>

      <dl className={styles.opportunityMetrics}>
        <div>
          <dt>Giorni stacco</dt>
          <dd>{opportunity.staccoDays}</dd>
        </div>
        <div>
          <dt>Ferie da usare</dt>
          <dd>{opportunity.costDays}</dd>
        </div>
      </dl>

      <p className={styles.explanationText}>{formatExplanation(opportunity)}</p>

      {isOverBudget ? <span className={styles.budgetChip}>Fuori budget</span> : null}
      {isSelected ? <span className={styles.selectedChip}>Selezionato</span> : null}

      <BookingCta opportunity={opportunity} />
    </article>
  );
}
