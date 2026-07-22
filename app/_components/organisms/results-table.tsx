import type { EngineOutput } from "@engine";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import { OpportunityCard } from "../molecules/opportunity-card";
import { OpportunityRow } from "../molecules/opportunity-row";

export function ResultsTable({
  onToggleOpportunity,
  output,
  selectedOpportunityIds,
}: {
  output: EngineOutput;
  onToggleOpportunity: (opportunityId: string) => void;
  selectedOpportunityIds: Set<string>;
}) {
  const t = useAppTranslations("results");

  if (output.opportunities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <strong>{t("noResultsTitle")}</strong>
        <span>{t("noResultsDescription")}</span>
      </div>
    );
  }

  return (
    <div className={styles.resultsView}>
      <div className={styles.mobileResultsList}>
        {output.opportunities.map((opportunity) => (
          <OpportunityCard
            availableBudget={output.availableBudget}
            isSelected={selectedOpportunityIds.has(opportunity.id)}
            key={opportunity.id}
            onToggleOpportunity={onToggleOpportunity}
            opportunity={opportunity}
          />
        ))}
      </div>

      <div className={styles.desktopTableWrap}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th scope="col">{t("table.choose")}</th>
              <th scope="col">{t("table.period")}</th>
              <th scope="col">{t("table.breakDays")}</th>
              <th scope="col">{t("table.leaveDays")}</th>
              <th scope="col">{t("table.leverage")}</th>
              <th scope="col">{t("table.reason")}</th>
              <th scope="col">{t("summary.remaining")}</th>
              <th scope="col">{t("table.book")}</th>
            </tr>
          </thead>
          <tbody>
            {output.opportunities.map((opportunity) => (
              <OpportunityRow
                availableBudget={output.availableBudget}
                isSelected={selectedOpportunityIds.has(opportunity.id)}
                key={opportunity.id}
                onToggleOpportunity={onToggleOpportunity}
                opportunity={opportunity}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.resultsDisclaimer}>{t("disclaimer")}</p>
      <p className={styles.affiliateDisclosure}>{t("affiliateDisclosure")}</p>
    </div>
  );
}
