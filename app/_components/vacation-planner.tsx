"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { tryIsoDate, type DayOff, type ISODateString, type UserConfig } from "@engine";
import {
  buildCalendarMonths,
  CALENDAR_LEGEND,
  DAY_TYPE_LABELS,
  getCalendarDayLabel,
  isSelectableVacationDay,
} from "../_lib/calendar-model";
import { calculateVacationPlan, type CalculationState } from "../_lib/calculate-vacation-plan";
import styles from "../styles/app.module.scss";
import {
  formatDateRange,
  formatExplanation,
  getSelectedOpportunityCost,
  ResultsTable,
} from "./results-table";
import { NewsletterConsentText } from "./newsletter-consent-text";
import {
  CONFIG_STORAGE_KEY,
  MAX_VACATION_DAYS,
  getInitialUserConfig,
  type PlannerConfig,
  serializeConfig,
  serializeStoredConfig,
} from "../_lib/user-config-url";

type DayOffRow = Omit<DayOff, "date"> & { date: string; id: string };
type NewsletterStatus = "idle" | "success" | "error";

const DAY_OFF_TYPE_LABELS: Record<DayOff["type"], string> = {
  companyClosure: "Chiusura aziendale — giorno gratuito",
  mandatoryLeave: "Giorno obbligatorio — scala dal budget",
};

const WEEKDAY_INITIALS = ["L", "M", "M", "G", "V", "S", "D"];

const SHORT_MONTH_LABELS = [
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

function formatSingleDay(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${SHORT_MONTH_LABELS[month - 1]}`;
}

/**
 * Collapses selected days into contiguous runs (adjacent in the selectable-day
 * sequence, so weekends/holidays don't split a work block) for a compact,
 * human-readable summary instead of a long list of ISO dates.
 */
function buildSelectedRanges(selectableIsoDates: string[], selected: Set<string>) {
  const ranges: Array<{ start: string; end: string }> = [];
  let previousIndex = -2;

  selectableIsoDates.forEach((iso, index) => {
    if (!selected.has(iso)) return;
    const last = ranges[ranges.length - 1];
    if (last && index === previousIndex + 1) {
      last.end = iso;
    } else {
      ranges.push({ start: iso, end: iso });
    }
    previousIndex = index;
  });

  return ranges.map(({ start, end }) =>
    start === end ? formatSingleDay(start) : formatDateRange(start, end)
  );
}

// TODO: valorizzare queste variabili in .env.local per aggiornare i dati del gestore
// mostrati nel footer senza toccare il codice. I valori qui sotto sono i fallback attuali.
const FOOTER_MANAGER = process.env.NEXT_PUBLIC_GESTORE ?? "Spatariu Rares";
const FOOTER_EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "privacy@calcolaferie.it";
// P.IVA opzionale: letta a render-time da process.env.NEXT_PUBLIC_PIVA, compare solo se impostata.

function createDayOffRow(id: string, type: DayOff["type"] = "companyClosure"): DayOffRow {
  return {
    id,
    date: "",
    type,
  };
}

function createDayOffRows(dayOffs: DayOff[]): DayOffRow[] {
  if (dayOffs.length === 0) return [createDayOffRow("day-off-0")];

  return dayOffs.map((dayOff, index) => ({
    ...dayOff,
    id: `day-off-${index}`,
  }));
}

function parseVacationDays(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_VACATION_DAYS) return null;
  return parsed;
}

function ResultsPanel({
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
          {bestOpportunity ? (
            <div className={styles.bestPonte}>
              <div className={styles.bestPonteLeva}>
                <strong>{bestOpportunity.leva.toFixed(1)}×</strong>
                <span>Leva</span>
              </div>
              <div className={styles.bestPonteBody}>
                <p className={styles.bestPonteEyebrow}>Il ponte migliore</p>
                <p className={styles.bestPonteRange}>
                  {formatDateRange(bestOpportunity.startDate, bestOpportunity.endDate)}
                </p>
                <p className={styles.bestPonteMeta}>
                  <b>{bestOpportunity.staccoDays} giorni di stacco</b> con{" "}
                  <b>
                    {bestOpportunity.costDays}{" "}
                    {bestOpportunity.costDays === 1 ? "giorno" : "giorni"} di ferie
                  </b>
                  . {formatExplanation(bestOpportunity)}
                </p>
              </div>
            </div>
          ) : null}
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

function CalendarView({
  calculation,
  onClearSelectedVacationDates,
  onSelectVacationDateRange,
  onToggleVacationDate,
  selectedVacationDates,
}: {
  calculation: CalculationState | null;
  onClearSelectedVacationDates: () => void;
  onSelectVacationDateRange: (isoDates: string[], shouldSelect: boolean) => void;
  onToggleVacationDate: (isoDate: string) => void;
  selectedVacationDates: Set<string>;
}) {
  const anchorDateRef = useRef<ISODateString | null>(null);
  const months = calculation ? buildCalendarMonths(calculation.input, calculation.output) : [];

  // Ordered list of every selectable day, used to fill Ctrl+click ranges and to
  // group the current selection into contiguous, readable date ranges.
  const selectableIsoDates = months.flatMap((month) =>
    month.days.filter((day) => isSelectableVacationDay(day.type)).map((day) => day.iso)
  );
  const selectedRanges = buildSelectedRanges(selectableIsoDates, selectedVacationDates);

  function handleDayClick(iso: ISODateString, extendRange: boolean) {
    const anchor = anchorDateRef.current;
    if (extendRange && anchor && anchor !== iso) {
      const start = selectableIsoDates.indexOf(anchor);
      const end = selectableIsoDates.indexOf(iso);
      if (start !== -1 && end !== -1) {
        const [from, to] = start < end ? [start, end] : [end, start];
        // Mirror the clicked day's state: if it's already selected, Ctrl+click
        // removes the whole range; otherwise it adds it.
        const shouldSelect = !selectedVacationDates.has(iso);
        onSelectVacationDateRange(selectableIsoDates.slice(from, to + 1), shouldSelect);
        anchorDateRef.current = iso;
        return;
      }
    }

    onToggleVacationDate(iso);
    anchorDateRef.current = iso;
  }

  return (
    <section className={styles.outputSection} aria-labelledby="calendar-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Calendario</p>
          <h2 id="calendar-title">Vista annuale</h2>
        </div>
      </div>

      <div className={styles.legend} aria-label="Legenda calendario">
        {CALENDAR_LEGEND.map((type) => (
          <span className={styles.legendItem} key={type}>
            <span className={`${styles.legendSwatch} ${styles[`dayCell_${type}`]}`} />
            {DAY_TYPE_LABELS[type]}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.dayCellSelected}`} />
          Ferie selezionate
        </span>
      </div>

      {calculation ? (
        <>
          <div className={styles.selectedVacationBar}>
            <div>
              <strong>{selectedVacationDates.size} giorni di ferie selezionati</strong>
              <span>
                {selectedRanges.length > 0
                  ? selectedRanges.join(", ")
                  : "Tocca un giorno lavorativo o consigliato. Ctrl+click (⌘ su Mac) per selezionare tutto l'intervallo."}
              </span>
            </div>
            {selectedVacationDates.size > 0 ? (
              <button
                className={styles.clearSelectionButton}
                onClick={onClearSelectedVacationDates}
                type="button"
              >
                Azzera
              </button>
            ) : null}
          </div>

          <div className={styles.calendarList}>
            {months.map((month) => (
              <article className={styles.monthBlock} key={month.key}>
                <h3>{month.label}</h3>
                <div className={styles.weekdayGrid} aria-hidden="true">
                  {WEEKDAY_INITIALS.map((weekday, index) => (
                    <span key={`${weekday}-${index}`}>{weekday}</span>
                  ))}
                </div>
                <div className={styles.monthGrid}>
                  {Array.from({ length: month.leadingBlankDays }).map((_, index) => (
                    <span className={styles.blankDay} key={`blank-${index}`} />
                  ))}
                  {month.days.map((day) => {
                    const isSelectable = isSelectableVacationDay(day.type) && !day.isPast;
                    const isSelected = selectedVacationDates.has(day.iso);
                    const baseLabel = getCalendarDayLabel(day);
                    const label = isSelected ? `${baseLabel} — Selezionata per ferie` : baseLabel;
                    const selectedClassName = isSelected ? ` ${styles.dayCellSelected}` : "";
                    const lockedClassName = isSelectable ? "" : ` ${styles.dayCellLocked}`;
                    const pastClassName = day.isPast ? ` ${styles.dayCellPast}` : "";

                    return (
                      <button
                        aria-disabled={!isSelectable}
                        aria-label={label}
                        aria-pressed={isSelectable ? isSelected : undefined}
                        className={`${styles.dayCell} ${styles[`dayCell_${day.type}`]}${selectedClassName}${lockedClassName}${pastClassName}`}
                        data-tooltip={label}
                        key={day.iso}
                        onClick={(event) => {
                          if (isSelectable) handleDayClick(day.iso, event.ctrlKey || event.metaKey);
                        }}
                        title={label}
                        type="button"
                      >
                        {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <strong>Calendario pronto dopo il calcolo</strong>
          <span>
            La vista annuale userà colori diversi per festivi, chiusure e ferie consigliate.
          </span>
        </div>
      )}
    </section>
  );
}

function NewsletterSignup({ isVisible }: { isVisible: boolean }) {
  const emailId = useId();
  const consentId = useId();
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const canSubmit = email.trim() !== "" && hasConsent && !isSubmitting;

  if (!isVisible) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: hasConsent }),
      });

      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.newsletterPanel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Newsletter</p>
        <h2>Aggiornamenti utili</h2>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          autoComplete="email"
          className={styles.input}
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </div>

      <label className={styles.checkboxLine} htmlFor={consentId}>
        <input
          id={consentId}
          checked={hasConsent}
          onChange={(event) => setHasConsent(event.target.checked)}
          type="checkbox"
        />
        <span>
          <NewsletterConsentText />
        </span>
      </label>

      <button className={styles.primaryButton} disabled={!canSubmit} type="submit">
        {isSubmitting ? "Invio..." : "Iscrivimi"}
      </button>

      {status === "success" ? (
        <p className={styles.shareStatus} role="status">
          Controlla la tua email per confermare l&apos;iscrizione.
        </p>
      ) : null}
      {status === "error" ? (
        <p className={styles.formError} role="alert">
          Iscrizione non riuscita. Riprova tra poco.
        </p>
      ) : null}
    </form>
  );
}

export function VacationPlanner() {
  const budgetId = useId();
  const patronId = useId();
  const nextDayOffId = useRef(1);
  const [totalVacationDays, setTotalVacationDays] = useState("");
  const [dayOffRows, setDayOffRows] = useState<DayOffRow[]>([createDayOffRow("day-off-0")]);
  const [patronSaintDate, setPatronSaintDate] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<PlannerConfig | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [selectedVacationDates, setSelectedVacationDates] = useState<Set<string>>(() => new Set());
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(
    () => new Set()
  );

  const parsedVacationDays = parseVacationDays(totalVacationDays);
  const canCalculate = parsedVacationDays !== null;

  useEffect(() => {
    const config = getInitialUserConfig(
      new URLSearchParams(window.location.search),
      window.localStorage.getItem(CONFIG_STORAGE_KEY)
    );
    if (!config) return;

    let isCancelled = false;
    const animationFrame = window.requestAnimationFrame(() => {
      if (isCancelled) return;

      const rows = createDayOffRows(config.daysOff);
      nextDayOffId.current = rows.length;
      setTotalVacationDays(String(config.totalVacationDays));
      setDayOffRows(rows);
      setPatronSaintDate(config.patronSaintDate ?? "");
      setSelectedVacationDates(new Set(config.selectedVacationDates ?? []));

      if (config.selectedVacationDates && config.selectedVacationDates.length > 0) {
        setSubmittedConfig(config);
        setCalculation(calculateVacationPlan(config));
      }
    });

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  function updateDayOffDate(id: string, date: string) {
    setDayOffRows((rows) => rows.map((row) => (row.id === id ? { ...row, date } : row)));
  }

  function updateDayOffType(id: string, type: DayOff["type"]) {
    setDayOffRows((rows) => rows.map((row) => (row.id === id ? { ...row, type } : row)));
  }

  function removeDayOff(id: string) {
    setDayOffRows((rows) =>
      rows.length === 1 ? [{ ...rows[0], date: "" }] : rows.filter((row) => row.id !== id)
    );
  }

  function toggleVacationDate(isoDate: string) {
    const nextDates = new Set(selectedVacationDates);
    if (nextDates.has(isoDate)) {
      nextDates.delete(isoDate);
    } else {
      nextDates.add(isoDate);
    }

    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function setVacationDateRange(isoDates: string[], shouldSelect: boolean) {
    if (isoDates.length === 0) return;
    const nextDates = new Set(selectedVacationDates);
    isoDates.forEach((date) => {
      if (shouldSelect) {
        nextDates.add(date);
      } else {
        nextDates.delete(date);
      }
    });
    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function toggleOpportunity(opportunityId: string) {
    const opportunities = calculation?.output.opportunities ?? [];
    const opportunity = opportunities.find((item) => item.id === opportunityId);

    const nextIds = new Set(selectedOpportunityIds);
    const isSelecting = !nextIds.has(opportunityId);
    if (isSelecting) {
      nextIds.add(opportunityId);
    } else {
      nextIds.delete(opportunityId);
    }
    setSelectedOpportunityIds(nextIds);

    if (!opportunity) return;

    const nextDates = new Set(selectedVacationDates);
    if (isSelecting) {
      opportunity.recommendedDays.forEach((date) => nextDates.add(date));
    } else {
      // Keep days still covered by another selected ponte.
      const daysStillNeeded = new Set(
        opportunities
          .filter((item) => item.id !== opportunityId && nextIds.has(item.id))
          .flatMap((item) => item.recommendedDays)
      );
      opportunity.recommendedDays.forEach((date) => {
        if (!daysStillNeeded.has(date)) nextDates.delete(date);
      });
    }

    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function buildUserConfig(totalVacationDays: number): UserConfig {
    const daysOff: DayOff[] = dayOffRows.flatMap(({ date, type }) => {
      if (date === "") return [];
      const iso = tryIsoDate(date);
      return iso ? [{ date: iso, type }] : [];
    });
    const parsedPatronSaintDate = patronSaintDate ? tryIsoDate(patronSaintDate) : null;

    return {
      totalVacationDays,
      daysOff,
      ...(parsedPatronSaintDate ? { patronSaintDate: parsedPatronSaintDate } : {}),
    };
  }

  function saveUserConfig(config: PlannerConfig) {
    try {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, serializeStoredConfig(config));
    } catch {
      // Storage can be unavailable in private contexts; calculation should still work.
    }
  }

  function withSelectedVacationDates(config: UserConfig, dates: Set<string>): PlannerConfig {
    const baseConfig: PlannerConfig = { ...config };
    delete baseConfig.selectedVacationDates;
    const selectedVacationDates = [...dates]
      .flatMap((date): ISODateString[] => {
        const iso = tryIsoDate(date);
        return iso ? [iso] : [];
      })
      .sort((a, b) => a.localeCompare(b));

    return {
      ...baseConfig,
      ...(selectedVacationDates.length > 0 ? { selectedVacationDates } : {}),
    };
  }

  function saveSelectedVacationDates(dates: Set<string>) {
    if (!submittedConfig) return;

    const nextConfig = withSelectedVacationDates(submittedConfig, dates);
    setSubmittedConfig(nextConfig);
    saveUserConfig(nextConfig);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsedVacationDays === null) return;

    const config = buildUserConfig(parsedVacationDays);

    setSelectedVacationDates(new Set());
    setSelectedOpportunityIds(new Set());
    setShareStatus("");
    setSubmittedConfig(config);
    saveUserConfig(config);
    setCalculation(calculateVacationPlan(config));
  }

  async function handleCopyLink() {
    if (!submittedConfig) return;

    const params = serializeConfig(submittedConfig);
    const link = `${window.location.origin}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(link);
      setShareStatus("Link copiato");
    } catch {
      setShareStatus("Copia non riuscita");
    }
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="page-title">
        <div>
          <p className={styles.eyebrow}>Planner ferie</p>
          <h1 id="page-title">CalcolaFerie</h1>
        </div>
        <p>
          Trova i ponti migliori nei prossimi 12 mesi, distinguendo ferie da spendere, chiusure
          aziendali e giorni obbligatori.
        </p>
        <div className={styles.heroFormula} aria-hidden="true">
          <span className={styles.heroFormulaNum}>9</span>
          <span className={styles.heroFormulaLabel}>giorni liberi</span>
          <span className={styles.heroFormulaOp}>÷</span>
          <span className={styles.heroFormulaNum}>4</span>
          <span className={styles.heroFormulaLabel}>ferie spese</span>
          <span className={styles.heroFormulaOp}>=</span>
          <span className={styles.heroFormulaResult}>2,3× leva</span>
        </div>
      </section>

      <section aria-labelledby="about-title" className={styles.aboutSection}>
        <p className={styles.eyebrow}>Come funziona</p>
        <h2 id="about-title">Calcolatore ponti ferie italiane</h2>
        <p>
          Scopri come ottimizzare le ferie sfruttando le festività italiane: inserisci il tuo budget
          di giorni e trova i ponti migliori per massimizzare i giorni di vacanza con il minimo di
          ferie spese.
        </p>
        <p>
          I risultati sono indicativi: verifica sempre festività locali, contratto e regole del tuo
          datore di lavoro prima di organizzare le assenze.
        </p>
      </section>

      <div className={styles.toolLayout}>
        <div className={styles.formColumn}>
          <form className={styles.formPanel} onSubmit={handleSubmit}>
            <div className={styles.panelHeader}>
              <p className={styles.eyebrow}>Input</p>
              <h2>Scenario</h2>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor={budgetId}>
                Giorni di ferie disponibili
              </label>
              <input
                id={budgetId}
                className={styles.input}
                inputMode="numeric"
                min="0"
                max={MAX_VACATION_DAYS}
                name="totalVacationDays"
                onChange={(event) => setTotalVacationDays(event.target.value)}
                placeholder="es. 20"
                required
                step="1"
                type="number"
                value={totalVacationDays}
              />
            </div>

            <details className={styles.advancedSearch}>
              <summary>Ricerca avanzata</summary>
              <div className={styles.advancedSearchContent}>
                <fieldset className={styles.fieldset}>
              <legend>Chiusure e giorni obbligati</legend>
              <p className={styles.helpText}>
                Se l&apos;azienda chiude senza usare ferie, scegli giorno gratuito. Se quel giorno
                viene scalato dal tuo monte ferie, scegli giorno obbligatorio.
              </p>

              <div className={styles.dayOffList}>
                {dayOffRows.map((row, index) => {
                  const dateId = `day-off-date-${row.id}`;
                  const radioName = `day-off-type-${row.id}`;

                  return (
                    <div className={styles.dayOffRow} key={row.id}>
                      <div className={styles.dayOffTopLine}>
                        <label className={styles.label} htmlFor={dateId}>
                          Data {index + 1}
                        </label>
                        <button
                          className={styles.linkButton}
                          onClick={() => removeDayOff(row.id)}
                          type="button"
                        >
                          Rimuovi
                        </button>
                      </div>
                      <input
                        id={dateId}
                        className={styles.input}
                        onChange={(event) => updateDayOffDate(row.id, event.target.value)}
                        type="date"
                        value={row.date}
                      />

                      <div
                        className={styles.segmentedControl}
                        role="radiogroup"
                        aria-label={`Tipo giorno ${index + 1}`}
                      >
                        {(Object.keys(DAY_OFF_TYPE_LABELS) as Array<DayOff["type"]>).map((type) => (
                          <label className={styles.segment} key={type}>
                            <input
                              checked={row.type === type}
                              name={radioName}
                              onChange={() => updateDayOffType(row.id, type)}
                              type="radio"
                              value={type}
                            />
                            <span>{DAY_OFF_TYPE_LABELS[type]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className={styles.secondaryButton}
                onClick={() => {
                  const id = `day-off-${nextDayOffId.current}`;
                  nextDayOffId.current += 1;
                  setDayOffRows((rows) => [...rows, createDayOffRow(id)]);
                }}
                type="button"
              >
                Aggiungi data
              </button>
                </fieldset>

                <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor={patronId}>
                Festività del tuo patrono locale (opzionale)
              </label>
              <input
                id={patronId}
                className={styles.input}
                onChange={(event) => setPatronSaintDate(event.target.value)}
                type="date"
                    value={patronSaintDate}
                  />
                </div>
              </div>
            </details>

            <div className={styles.submitActions}>
              <button className={styles.primaryButton} disabled={!canCalculate} type="submit">
                Calcola
              </button>
              {submittedConfig ? (
                <button className={styles.secondaryButton} onClick={handleCopyLink} type="button">
                  Copia link
                </button>
              ) : null}
            </div>
            {shareStatus ? (
              <p className={styles.shareStatus} role="status">
                {shareStatus}
              </p>
            ) : null}
          </form>

          <NewsletterSignup isVisible={calculation !== null} />
        </div>

        <div className={styles.outputStack}>
          <ResultsPanel
            calculation={calculation}
            onToggleOpportunity={toggleOpportunity}
            selectedOpportunityIds={selectedOpportunityIds}
          />
          <CalendarView
            calculation={calculation}
            onClearSelectedVacationDates={() => {
              const nextDates = new Set<string>();
              setSelectedVacationDates(nextDates);
              saveSelectedVacationDates(nextDates);
            }}
            onSelectVacationDateRange={setVacationDateRange}
            onToggleVacationDate={toggleVacationDate}
            selectedVacationDates={selectedVacationDates}
          />
        </div>
      </div>

      <footer className={styles.pageFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <p className={styles.footerName}>CalcolaFerie</p>
            <p className={styles.footerTagline}>
              Ponti e ferie italiane, ottimizzati sul tuo budget di giorni.
            </p>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerHeading}>Contatti</p>
            <a href={`mailto:${FOOTER_EMAIL}`}>{FOOTER_EMAIL}</a>
            <span>Gestore: {FOOTER_MANAGER}</span>
            {process.env.NEXT_PUBLIC_PIVA ? (
              <span>P.IVA: {process.env.NEXT_PUBLIC_PIVA}</span>
            ) : null}
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerHeading}>Legale</p>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <p className={styles.footerBottom}>
          © {new Date().getFullYear()} CalcolaFerie · I risultati sono indicativi: verifica sempre
          festività locali e regole del tuo contratto.
        </p>
      </footer>
    </main>
  );
}
