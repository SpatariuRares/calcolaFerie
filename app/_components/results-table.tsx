import { type BridgeOpportunity, type EngineOutput, type WeekdayIndex } from "@engine";
import { buildBookingDeepLink } from "../_lib/affiliate-link";
import { COMPANY_CLOSURE_LABEL, holidayLabel } from "../_lib/holiday-labels";
import styles from "../styles/app.module.scss";

const AFFILIATE_DISCLOSURE =
  "Link affiliato: se prenoti, riceviamo una commissione senza costi extra per te.";

const RESULTS_DISCLAIMER =
  "I risultati sono indicativi. Verifica le festività patronali e le norme del tuo contratto/datore di lavoro.";

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

  if (explanation.fusedHolidayKeys && explanation.fusedHolidayKeys.length > 1) {
    return `${explanation.fusedHolidayKeys.map(holidayLabel).join(" + ")} → ${resultPhrase}`;
  }

  const anchorLabel =
    explanation.anchorKind === "companyClosure"
      ? COMPANY_CLOSURE_LABEL
      : holidayLabel(explanation.anchorHolidayKey ?? "");

  return `${anchorLabel} cade ${WEEKDAY_LABELS[explanation.anchorWeekday]} → ${resultPhrase}`;
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

export function getSelectedOpportunityCost(
  opportunities: BridgeOpportunity[],
  selectedOpportunityIds: Set<string>
) {
  return opportunities.reduce(
    (total, opportunity) =>
      selectedOpportunityIds.has(opportunity.id) ? total + opportunity.costDays : total,
    0
  );
}

function BookingCta({ opportunity }: { opportunity: BridgeOpportunity }) {
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

type ResultsSelectionProps = {
  onToggleOpportunity: (opportunityId: string) => void;
  selectedOpportunityIds: Set<string>;
};

function OpportunityCard({
  opportunity,
  availableBudget,
  isSelected,
  onToggleOpportunity,
}: {
  opportunity: BridgeOpportunity;
  availableBudget: number;
  isSelected: boolean;
} & ResultsSelectionProps) {
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
      {isSelected ? <span className={styles.selectedChip}>Selezionato</span> : null}

      <BookingCta opportunity={opportunity} />
    </article>
  );
}

function OpportunityRow({
  opportunity,
  isSelected,
  onToggleOpportunity,
}: {
  opportunity: BridgeOpportunity;
  isSelected: boolean;
} & ResultsSelectionProps) {
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
        <span className={getLevaClassName(opportunity.leva)}>{opportunity.leva.toFixed(1)}×</span>
      </td>
      <td>{formatExplanation(opportunity)}</td>
      <td className={styles.bookingCell} onClick={(event) => event.stopPropagation()}>
        <BookingCta opportunity={opportunity} />
      </td>
    </tr>
  );
}

export function ResultsTable({
  onToggleOpportunity,
  output,
  selectedOpportunityIds,
}: {
  output: EngineOutput;
} & ResultsSelectionProps) {
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
            selectedOpportunityIds={selectedOpportunityIds}
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
              <th scope="col">Prenota</th>
            </tr>
          </thead>
          <tbody>
            {output.opportunities.map((opportunity) => (
              <OpportunityRow
                isSelected={selectedOpportunityIds.has(opportunity.id)}
                key={opportunity.id}
                onToggleOpportunity={onToggleOpportunity}
                opportunity={opportunity}
                selectedOpportunityIds={selectedOpportunityIds}
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
