import {
  formatDateRange,
  formatExplanation,
  getSelectedOpportunityCost,
} from "../../_lib/opportunity-display";
import { type CalculationState } from "../../_lib/calculate-vacation-plan";
import { useAppLocale, useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import { ResultsTable } from "./results-table";

export function ResultsPanel({
  calculation,
  onToggleOpportunity,
  selectedOpportunityIds,
}: {
  calculation: CalculationState | null;
  onToggleOpportunity: (opportunityId: string) => void;
  selectedOpportunityIds: Set<string>;
}) {
  const t = useAppTranslations("results");
  const locale = useAppLocale();
  const output = calculation?.output;
  const opportunities = output?.opportunities ?? [];
  const selectedOpportunityCost = output
    ? getSelectedOpportunityCost(output.opportunities, selectedOpportunityIds)
    : 0;
  const remainingBudget = output ? output.availableBudget - selectedOpportunityCost : 0;
  const bestOpportunity =
    opportunities.length > 0
      ? opportunities.reduce((best, opportunity) =>
          opportunity.leva > best.leva ? opportunity : best
        )
      : null;

  return (
    <section className={styles.outputSection} aria-labelledby="results-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="results-title">{t("title")}</h2>
        </div>
      </div>
      {calculation ? (
        <>
          {bestOpportunity ? (
            <div className={styles.bestPonte}>
              <div className={styles.bestPonteLeva}>
                <strong>{bestOpportunity.leva.toFixed(1)}×</strong>
                <span>{t("leverage")}</span>
              </div>
              <div className={styles.bestPonteBody}>
                <p className={styles.bestPonteEyebrow}>{t("best")}</p>
                <p className={styles.bestPonteRange}>
                  {formatDateRange(bestOpportunity.startDate, bestOpportunity.endDate, locale)}
                </p>
                <p className={styles.bestPonteMeta}>
                  {t("bestSummary", {
                    staccoDays: bestOpportunity.staccoDays,
                    costDays: bestOpportunity.costDays,
                    explanation: formatExplanation(bestOpportunity),
                  })}
                </p>
              </div>
            </div>
          ) : null}
          <dl className={styles.summaryGrid}>
            <div>
              <dt>{t("summary.availableBudget")}</dt>
              <dd>{output?.availableBudget ?? 0}</dd>
            </div>
            <div>
              <dt>{t("summary.used")}</dt>
              <dd>{selectedOpportunityCost}</dd>
            </div>
            <div className={remainingBudget < 0 ? styles.summaryWarning : undefined}>
              <dt>{t("summary.remaining")}</dt>
              <dd>{remainingBudget}</dd>
            </div>
            <div>
              <dt>{t("summary.opportunities")}</dt>
              <dd>{opportunities.length}</dd>
            </div>
            <div>
              <dt>{t("summary.bestLeverage")}</dt>
              <dd>{bestOpportunity ? `${bestOpportunity.leva.toFixed(1)}×` : "0×"}</dd>
            </div>
          </dl>
          {remainingBudget < 0 ? (
            <p className={styles.budgetWarning}>
              {t("budgetWarning", { days: Math.abs(remainingBudget) })}
            </p>
          ) : null}
          <ResultsTable
            onToggleOpportunity={onToggleOpportunity}
            output={calculation.output}
            selectedOpportunityIds={selectedOpportunityIds}
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <strong>{t("notStartedTitle")}</strong>
          <span>{t("notStartedDescription")}</span>
        </div>
      )}
    </section>
  );
}
