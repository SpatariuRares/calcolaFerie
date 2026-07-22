import type { BridgeOpportunity } from "@engine";
import { formatDateRange, formatExplanation } from "../../_lib/opportunity-display";
import { useAppLocale, useAppTranslations } from "../../_lib/use-app-i18n";
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
  const t = useAppTranslations("results");
  const holidayT = useAppTranslations("holidays");
  const locale = useAppLocale();
  const translate = (key: string, values?: Record<string, string | number>) =>
    t(key as never, values as never);
  const translateHoliday = (key: string) => holidayT(key as never);
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
          <span>{formatDateRange(opportunity.startDate, opportunity.endDate, locale)}</span>
        </span>
        <LevaBadge leva={opportunity.leva} />
      </div>

      <dl className={styles.opportunityMetrics}>
        <div>
          <dt>{t("metrics.breakDays")}</dt>
          <dd>{opportunity.staccoDays}</dd>
        </div>
        <div>
          <dt>{t("metrics.leaveDays")}</dt>
          <dd>{opportunity.costDays}</dd>
        </div>
      </dl>

      <p className={styles.explanationText}>
        {formatExplanation(opportunity, translate, translateHoliday)}
      </p>

      {isOverBudget ? <span className={styles.budgetChip}>{t("overBudget")}</span> : null}
      {isSelected ? <span className={styles.selectedChip}>{t("selected")}</span> : null}

      <BookingCta endDate={opportunity.endDate} startDate={opportunity.startDate} />
    </article>
  );
}
