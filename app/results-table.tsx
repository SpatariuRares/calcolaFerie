import { type BridgeOpportunity, type EngineOutput, type WeekdayIndex } from "@/engine/src/index";
import styles from "./page.module.css";

const MONTH_LABELS = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

const WEEKDAY_LABELS: Record<WeekdayIndex, string> = {
  0: "domenica",
  1: "lunedì",
  2: "martedì",
  3: "mercoledì",
  4: "giovedì",
  5: "venerdì",
  6: "sabato",
};

export type LevaTier = "high" | "medium" | "low";

function parseISODateParts(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return {
    day,
    month,
    year,
  };
}

function vacationDayLabel(costDays: number) {
  return costDays === 1 ? "giorno" : "giorni";
}

export function formatDateRange(startDate: string, endDate: string) {
  const start = parseISODateParts(startDate);
  const end = parseISODateParts(endDate);
  const startMonth = MONTH_LABELS[start.month - 1];
  const endMonth = MONTH_LABELS[end.month - 1];

  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${endMonth}`;
  }

  if (start.year === end.year) {
    return `${start.day} ${startMonth}–${end.day} ${endMonth}`;
  }

  return `${start.day} ${startMonth} ${start.year}–${end.day} ${endMonth} ${end.year}`;
}

export function formatExplanation(opportunity: BridgeOpportunity) {
  const { explanation } = opportunity;
  const costDays = explanation.costDays;
  const staccoDays = explanation.staccoDays;

  if (costDays === 0) {
    return "Nessuna feria necessaria — blocco già libero";
  }

  const costPhrase = `${costDays} ${vacationDayLabel(costDays)} di ferie`;
  const resultPhrase = `${costPhrase} = ${staccoDays} giorni di stacco`;

  if (explanation.fusedHolidayNames && explanation.fusedHolidayNames.length > 1) {
    return `${explanation.fusedHolidayNames.join(" + ")} → ${resultPhrase}`;
  }

  return `${explanation.anchorHolidayName} cade ${WEEKDAY_LABELS[explanation.anchorWeekday]} → ${resultPhrase}`;
}

export function getLevaTier(leva: number): LevaTier {
  if (leva >= 4) return "high";
  if (leva >= 2.5) return "medium";
  return "low";
}

function getLevaClassName(leva: number) {
  const tier = getLevaTier(leva);
  return `${styles.levaBadge} ${styles[`levaBadge_${tier}`]}`;
}

function OpportunityCard({
  opportunity,
  availableBudget,
}: {
  opportunity: BridgeOpportunity;
  availableBudget: number;
}) {
  const isOverBudget = opportunity.costDays > availableBudget;

  return (
    <article className={styles.opportunityCard}>
      <div className={styles.opportunityCardHeader}>
        <h3>{formatDateRange(opportunity.startDate, opportunity.endDate)}</h3>
        <span className={getLevaClassName(opportunity.leva)}>{opportunity.leva.toFixed(1)}×</span>
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
    </article>
  );
}

function OpportunityRow({
  opportunity,
  availableBudget,
}: {
  opportunity: BridgeOpportunity;
  availableBudget: number;
}) {
  const isOverBudget = opportunity.costDays > availableBudget;

  return (
    <tr>
      <th scope="row">{formatDateRange(opportunity.startDate, opportunity.endDate)}</th>
      <td>{opportunity.staccoDays}</td>
      <td>{opportunity.costDays}</td>
      <td>
        <span className={getLevaClassName(opportunity.leva)}>{opportunity.leva.toFixed(1)}×</span>
      </td>
      <td>{formatExplanation(opportunity)}</td>
      <td>{isOverBudget ? <span className={styles.budgetChip}>Fuori budget</span> : null}</td>
    </tr>
  );
}

export function ResultsTable({ output }: { output: EngineOutput }) {
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
            key={opportunity.id}
            opportunity={opportunity}
          />
        ))}
      </div>

      <div className={styles.desktopTableWrap}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th scope="col">Periodo</th>
              <th scope="col">Giorni stacco</th>
              <th scope="col">Ferie da usare</th>
              <th scope="col">Leva</th>
              <th scope="col">Perché conviene</th>
              <th scope="col">Budget</th>
            </tr>
          </thead>
          <tbody>
            {output.opportunities.map((opportunity) => (
              <OpportunityRow
                availableBudget={output.availableBudget}
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
