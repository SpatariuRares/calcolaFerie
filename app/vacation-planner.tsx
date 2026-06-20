"use client";

import { useEffect, useId, useRef, useState } from "react";
import { type DayOff, type UserConfig } from "@/engine/src/index";
import {
  buildCalendarMonths,
  CALENDAR_LEGEND,
  DAY_TYPE_LABELS,
  getCalendarDayLabel,
  isSelectableVacationDay,
} from "./calendar-model";
import { calculateVacationPlan, type CalculationState } from "./calculate-vacation-plan";
import styles from "./page.module.scss";
import { getSelectedOpportunityCost, ResultsTable } from "./results-table";
import { CONFIG_STORAGE_KEY, getInitialUserConfig, serializeConfig } from "./user-config-url";

type DayOffRow = DayOff & { id: string };

const DAY_OFF_TYPE_LABELS: Record<DayOff["type"], string> = {
  companyClosure: "Chiusura aziendale — giorno gratuito",
  mandatoryLeave: "Giorno obbligatorio — scala dal budget",
};

const WEEKDAY_INITIALS = ["L", "M", "M", "G", "V", "S", "D"];

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
  if (!Number.isInteger(parsed) || parsed < 0) return null;
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
  onToggleVacationDate,
  selectedVacationDates,
}: {
  calculation: CalculationState | null;
  onClearSelectedVacationDates: () => void;
  onToggleVacationDate: (isoDate: string) => void;
  selectedVacationDates: Set<string>;
}) {
  const months = calculation ? buildCalendarMonths(calculation.input, calculation.output) : [];
  const sortedSelectedDates = [...selectedVacationDates].sort((a, b) => a.localeCompare(b));

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
                {sortedSelectedDates.length > 0
                  ? sortedSelectedDates.join(", ")
                  : "Tocca un giorno lavorativo o consigliato nel calendario."}
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
                    const isSelectable = isSelectableVacationDay(day.type);
                    const isSelected = selectedVacationDates.has(day.iso);
                    const baseLabel = getCalendarDayLabel(day);
                    const label = isSelected ? `${baseLabel} — Selezionata per ferie` : baseLabel;
                    const selectedClassName = isSelected ? ` ${styles.dayCellSelected}` : "";
                    const lockedClassName = isSelectable ? "" : ` ${styles.dayCellLocked}`;

                    return (
                      <button
                        aria-disabled={!isSelectable}
                        aria-label={label}
                        aria-pressed={isSelectable ? isSelected : undefined}
                        className={`${styles.dayCell} ${styles[`dayCell_${day.type}`]}${selectedClassName}${lockedClassName}`}
                        data-tooltip={label}
                        key={day.iso}
                        onClick={() => {
                          if (isSelectable) onToggleVacationDate(day.iso);
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

export function VacationPlanner() {
  const budgetId = useId();
  const patronId = useId();
  const nextDayOffId = useRef(1);
  const [totalVacationDays, setTotalVacationDays] = useState("");
  const [dayOffRows, setDayOffRows] = useState<DayOffRow[]>([createDayOffRow("day-off-0")]);
  const [patronSaintDate, setPatronSaintDate] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<UserConfig | null>(null);
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
    setSelectedVacationDates((dates) => {
      const nextDates = new Set(dates);
      if (nextDates.has(isoDate)) {
        nextDates.delete(isoDate);
      } else {
        nextDates.add(isoDate);
      }
      return nextDates;
    });
  }

  function toggleOpportunity(opportunityId: string) {
    setSelectedOpportunityIds((ids) => {
      const nextIds = new Set(ids);
      if (nextIds.has(opportunityId)) {
        nextIds.delete(opportunityId);
      } else {
        nextIds.add(opportunityId);
      }
      return nextIds;
    });
  }

  function buildUserConfig(totalVacationDays: number): UserConfig {
    return {
      totalVacationDays,
      daysOff: dayOffRows
        .filter((row) => row.date !== "")
        .map(({ date, type }) => ({
          date,
          type,
        })),
      ...(patronSaintDate ? { patronSaintDate } : {}),
    };
  }

  function saveUserConfig(config: UserConfig) {
    try {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Storage can be unavailable in private contexts; calculation should still work.
    }
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
      </section>

      <div className={styles.toolLayout}>
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
              name="totalVacationDays"
              onChange={(event) => setTotalVacationDays(event.target.value)}
              placeholder="es. 20"
              required
              step="1"
              type="number"
              value={totalVacationDays}
            />
          </div>

          <fieldset className={styles.fieldset}>
            <legend>Chiusure e giorni obbligati</legend>
            <p className={styles.helpText}>
              Se l'azienda chiude senza usare ferie, scegli giorno gratuito. Se quel giorno viene
              scalato dal tuo monte ferie, scegli giorno obbligatorio.
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

        <div className={styles.outputStack}>
          <ResultsPanel
            calculation={calculation}
            onToggleOpportunity={toggleOpportunity}
            selectedOpportunityIds={selectedOpportunityIds}
          />
          <CalendarView
            calculation={calculation}
            onClearSelectedVacationDates={() => setSelectedVacationDates(new Set())}
            onToggleVacationDate={toggleVacationDate}
            selectedVacationDates={selectedVacationDates}
          />
        </div>
      </div>
    </main>
  );
}
