import { getSelectedOpportunityCost } from "../../_lib/opportunity-display";
import { type CalculationState } from "../../_lib/calculate-vacation-plan";
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
          <p className={styles.eyebrow}>Risultati</p>
          <h2 id="results-title">Ponti consigliati</h2>
        </div>
      </div>
      {calculation ? (
        <>
          <dl className={styles.summaryGrid}>
            <div>
              <dt>Budget utile</dt>
              <dd>{output?.availableBudget ?? 0}</dd>
            </div>
            <div>
              <dt>Scalati</dt>
              <dd>{selectedOpportunityCost}</dd>
            </div>
            <div className={remainingBudget < 0 ? styles.summaryWarning : undefined}>
              <dt>Residuo</dt>
              <dd>{remainingBudget}</dd>
            </div>
            <div>
              <dt>Opportunità</dt>
              <dd>{opportunities.length}</dd>
            </div>
            <div>
              <dt>Miglior leva</dt>
              <dd>{bestOpportunity ? `${bestOpportunity.leva.toFixed(1)}×` : "0×"}</dd>
            </div>
          </dl>
          {remainingBudget < 0 ? (
            <p className={styles.budgetWarning}>
              Le selezioni superano il budget disponibile di {Math.abs(remainingBudget)} giorni.
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
          <strong>Nessun calcolo avviato</strong>
          <span>Inserisci il budget e premi Calcola per vedere le occasioni ordinate.</span>
        </div>
      )}
    </section>
  );
}
