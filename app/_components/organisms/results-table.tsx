import type { EngineOutput } from "@engine";
import styles from "../../styles/app.module.scss";
import { OpportunityCard } from "../molecules/opportunity-card";
import { OpportunityRow } from "../molecules/opportunity-row";

const AFFILIATE_DISCLOSURE =
  "Link affiliato: se prenoti, riceviamo una commissione senza costi extra per te.";

const RESULTS_DISCLAIMER =
  "I risultati sono indicativi. Verifica le festività patronali e le norme del tuo contratto/datore di lavoro.";

export function ResultsTable({
  onToggleOpportunity,
  output,
  selectedOpportunityIds,
}: {
  output: EngineOutput;
  onToggleOpportunity: (opportunityId: string) => void;
  selectedOpportunityIds: Set<string>;
}) {
  if (output.opportunities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <strong>Nessun ponte trovato</strong>
        <span>Prova ad aumentare il budget o ad aggiungere festività e chiusure nel periodo.</span>
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
              <th scope="col">Scegli</th>
              <th scope="col">Periodo</th>
              <th scope="col">Giorni stacco</th>
              <th scope="col">Ferie da usare</th>
              <th scope="col">Leva</th>
              <th scope="col">Perché conviene</th>
              <th scope="col">Budget</th>
              <th scope="col">Prenota</th>
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

      <p className={styles.resultsDisclaimer}>{RESULTS_DISCLAIMER}</p>
      <p className={styles.affiliateDisclosure}>{AFFILIATE_DISCLOSURE}</p>
    </div>
  );
}
