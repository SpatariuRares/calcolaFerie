import { type BridgeOpportunity, type EngineOutput, type WeekdayIndex } from "@engine";
import { useLocale, useTranslations } from "next-intl";
import { buildBookingDeepLink } from "../_lib/affiliate-link";
import { companyClosureLabel, holidayLabel, type HolidayTranslator } from "../_lib/holiday-labels";
import styles from "../styles/app.module.scss";

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

const EN_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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

export function formatSingleDay(isoDate: string, locale = "it") {
  const { day, month } = parseISODateParts(isoDate);
  const months = locale.toLowerCase().startsWith("it") ? MONTH_LABELS : EN_MONTH_LABELS;
  return `${day} ${months[month - 1]}`;
}

export function formatDateRange(startDate: string, endDate: string, locale = "it") {
  const start = parseISODateParts(startDate);
  const end = parseISODateParts(endDate);
  const months = locale.toLowerCase().startsWith("it") ? MONTH_LABELS : EN_MONTH_LABELS;
  const startMonth = months[start.month - 1];
  const endMonth = months[end.month - 1];

  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${endMonth}`;
  }

  if (start.year === end.year) {
    return `${start.day} ${startMonth}–${end.day} ${endMonth}`;
  }

  return `${start.day} ${startMonth} ${start.year}–${end.day} ${endMonth} ${end.year}`;
}

export function formatExplanation(
  opportunity: BridgeOpportunity,
  translate?: (key: string, values?: Record<string, string | number>) => string,
  translateHoliday?: HolidayTranslator
) {
  const { explanation } = opportunity;
  const costDays = explanation.costDays;
  const staccoDays = explanation.staccoDays;

  if (costDays === 0) {
    return translate
      ? translate("explanation.noLeave")
      : "Nessuna feria necessaria — blocco già libero";
  }

  const costPhrase = `${costDays} ${vacationDayLabel(costDays)} di ferie`;
  const resultPhrase = `${costPhrase} = ${staccoDays} giorni di stacco`;

  if (explanation.fusedHolidayKeys && explanation.fusedHolidayKeys.length > 1) {
    const holidays = explanation.fusedHolidayKeys
      .map((key) => holidayLabel(key, translateHoliday))
      .join(" + ");
    return translate
      ? translate("explanation.fused", { holidays, result: resultPhrase })
      : `${holidays} → ${resultPhrase}`;
  }

  const anchorLabel =
    explanation.anchorKind === "companyClosure"
      ? companyClosureLabel(translateHoliday)
      : holidayLabel(explanation.anchorHolidayKey ?? "", translateHoliday);

  return translate
    ? translate("explanation.anchored", {
        anchor: anchorLabel,
        weekday: WEEKDAY_LABELS[explanation.anchorWeekday],
        result: resultPhrase,
      })
    : `${anchorLabel} cade ${WEEKDAY_LABELS[explanation.anchorWeekday]} → ${resultPhrase}`;
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

function BookingCta({ startDate, endDate }: { startDate: string; endDate: string }) {
  const t = useTranslations("results");
  const href = buildBookingDeepLink({ startDate, endDate });

  // Stop propagation so booking does not toggle the row/card selection.
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <span className={styles.bookingCtaWrap}>
      <span className={styles.affiliateLabel}>{t("affiliateLabel")}</span>
      <a
        className={styles.bookingCta}
        href={href}
        onClick={stop}
        onKeyDown={stop}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        {t("bookCta")}
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
  const t = useTranslations("results");
  const holidayT = useTranslations("holidays");
  const locale = useLocale();
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
        <span className={getLevaClassName(opportunity.leva)}>{opportunity.leva.toFixed(1)}×</span>
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

function OpportunityRow({
  opportunity,
  isSelected,
  onToggleOpportunity,
}: {
  opportunity: BridgeOpportunity;
  isSelected: boolean;
} & ResultsSelectionProps) {
  const t = useTranslations("results");
  const locale = useLocale();
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
        <span className={getLevaClassName(opportunity.leva)}>{opportunity.leva.toFixed(1)}×</span>
      </td>
      <td className={styles.bookingCell} onClick={(event) => event.stopPropagation()}>
        <BookingCta endDate={opportunity.endDate} startDate={opportunity.startDate} />
      </td>
    </tr>
  );
}

export type SelectedVacationRange = {
  start: string;
  end: string;
  days: number;
};

export function SelectedVacationsTable({ ranges }: { ranges: SelectedVacationRange[] }) {
  const t = useTranslations("results");
  const locale = useLocale();

  if (ranges.length === 0) {
    return null;
  }

  const totalDays = ranges.reduce((total, range) => total + range.days, 0);

  const formatPeriod = (range: SelectedVacationRange) =>
    range.start === range.end
      ? formatSingleDay(range.start, locale)
      : formatDateRange(range.start, range.end, locale);

  const handleDownloadPdf = () => {
    const rowsHtml = ranges
      .map(
        (range) =>
          `<tr><td>${formatPeriod(range)}</td><td class="num">${range.days}</td></tr>`
      )
      .join("");
    const documentHtml = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${t("pdfTitle")}</title><style>
      body{font-family:Inter,Arial,sans-serif;color:#1b2620;margin:32px;}
      h1{font-size:20px;margin:0 0 16px;}
      table{width:100%;border-collapse:collapse;font-size:14px;}
      th,td{border-bottom:1px solid #d7dee2;padding:8px 10px;text-align:left;}
      thead th{background:#f2f5f6;text-transform:uppercase;font-size:11px;letter-spacing:0.04em;}
      td.num,th.num{text-align:right;}
      tfoot td{font-weight:700;background:#f8fafb;}
    </style></head><body>
      <h1>${t("pdfTitle")}</h1>
      <table>
        <thead><tr><th>${t("table.period")}</th><th class="num">${t("table.leaveDays")}</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr><td>${t("total")}</td><td class="num">${totalDays}</td></tr></tfoot>
      </table>
    </body></html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(documentHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener("load", () => {
      printWindow.print();
    });
    // Fallback if the load event already fired.
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <section className={styles.outputSection} aria-labelledby="selected-vacations-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="selected-vacations-title">{t("selectedLeave")}</h2>
        </div>
        <button className={styles.secondaryButton} onClick={handleDownloadPdf} type="button">
          {t("downloadPdf")}
        </button>
      </div>
      <div className={styles.selectedTableWrap}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th scope="col">{t("table.period")}</th>
              <th scope="col">{t("table.leaveDays")}</th>
              <th scope="col">{t("table.book")}</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((range) => (
              <tr key={range.start}>
                <th scope="row">
                  {range.start === range.end
                    ? formatSingleDay(range.start, locale)
                    : formatDateRange(range.start, range.end, locale)}
                </th>
                <td>{range.days}</td>
                <td className={styles.bookingCell}>
                  <BookingCta endDate={range.end} startDate={range.start} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t("total")}</th>
              <td>{totalDays}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export function ResultsTable({
  onToggleOpportunity,
  output,
  selectedOpportunityIds,
}: {
  output: EngineOutput;
} & ResultsSelectionProps) {
  const t = useTranslations("results");

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
            selectedOpportunityIds={selectedOpportunityIds}
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
              <th scope="col">{t("table.book")}</th>
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

      <p className={styles.resultsDisclaimer}>{t("disclaimer")}</p>
      <p className={styles.affiliateDisclosure}>{t("affiliateDisclosure")}</p>
    </div>
  );
}
