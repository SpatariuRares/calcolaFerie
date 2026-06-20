"use client";

import { useId, useRef, useState } from "react";
import { type DayOff, type DayType, type EngineInput, type EngineOutput } from "@/engine/src/index";
import { calculateVacationPlan, type CalculationState } from "./calculate-vacation-plan";
import styles from "./page.module.css";
import { ResultsTable } from "./results-table";

type DayOffRow = DayOff & { id: string };
type CalendarDay = {
  iso: string;
  dayNumber: number;
  type: DayType;
  holidayName?: string;
};
type CalendarMonth = {
  key: string;
  label: string;
  leadingBlankDays: number;
  days: CalendarDay[];
};

const DAY_OFF_TYPE_LABELS: Record<DayOff["type"], string> = {
  companyClosure: "Chiusura aziendale — giorno gratuito",
  mandatoryLeave: "Giorno obbligatorio — scala dal budget",
};

const DAY_TYPE_LABELS: Record<DayType, string> = {
  weekend: "Weekend",
  publicHoliday: "Festivo",
  companyClosure: "Chiusura",
  mandatoryLeave: "Ferie obbligatorie",
  recommendedLeave: "Ferie consigliate",
  workday: "Lavorativo",
};

const CALENDAR_LEGEND: DayType[] = [
  "recommendedLeave",
  "publicHoliday",
  "companyClosure",
  "mandatoryLeave",
  "weekend",
  "workday",
];

const WEEKDAY_INITIALS = ["L", "M", "M", "G", "V", "S", "D"];

const MONTH_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function createDayOffRow(id: string, type: DayOff["type"] = "companyClosure"): DayOffRow {
  return {
    id,
    date: "",
    type,
  };
}

function parseVacationDays(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function parseISODate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`);
}

function dateToISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayFirstBlankDays(date: Date) {
  return (date.getDay() + 6) % 7;
}

function buildCalendarMonths(input: EngineInput, output: EngineOutput): CalendarMonth[] {
  const startDate = parseISODate(input.windowStart);
  const endDate = parseISODate(input.windowEnd);
  const holidayNames = new Map(input.publicHolidays.map((holiday) => [holiday.date, holiday.name]));
  const months: CalendarMonth[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (cursor <= endDate) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const iso = dateToISO(date);
      const type = output.dayMap.get(iso);

      if (!type || iso < input.windowStart || iso > input.windowEnd) continue;

      days.push({
        iso,
        dayNumber: day,
        type,
        holidayName: holidayNames.get(iso),
      });
    }

    months.push({
      key: `${year}-${month}`,
      label: MONTH_FORMATTER.format(firstDay),
      leadingBlankDays:
        year === startDate.getFullYear() && month === startDate.getMonth()
          ? getMondayFirstBlankDays(startDate)
          : getMondayFirstBlankDays(firstDay),
      days,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function ResultsPanel({ calculation }: { calculation: CalculationState | null }) {
  const output = calculation?.output;
  const opportunities = output?.opportunities ?? [];
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
              <dt>Opportunità</dt>
              <dd>{opportunities.length}</dd>
            </div>
            <div>
              <dt>Miglior leva</dt>
              <dd>{bestOpportunity ? `${bestOpportunity.leva.toFixed(1)}×` : "0×"}</dd>
            </div>
          </dl>
          <ResultsTable output={calculation.output} />
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

function CalendarView({ calculation }: { calculation: CalculationState | null }) {
  const months = calculation ? buildCalendarMonths(calculation.input, calculation.output) : [];

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
      </div>

      {calculation ? (
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
                  const label = [
                    DAY_FORMATTER.format(parseISODate(day.iso)),
                    DAY_TYPE_LABELS[day.type],
                    day.holidayName,
                  ]
                    .filter(Boolean)
                    .join(" — ");

                  return (
                    <span
                      aria-label={label}
                      className={`${styles.dayCell} ${styles[`dayCell_${day.type}`]}`}
                      key={day.iso}
                      title={label}
                    >
                      {day.dayNumber}
                    </span>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
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

  const parsedVacationDays = parseVacationDays(totalVacationDays);
  const canCalculate = parsedVacationDays !== null;

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsedVacationDays === null) return;

    setCalculation(
      calculateVacationPlan({
        totalVacationDays: parsedVacationDays,
        daysOff: dayOffRows
          .filter((row) => row.date !== "")
          .map(({ date, type }) => ({
            date,
            type,
          })),
        ...(patronSaintDate ? { patronSaintDate } : {}),
      })
    );
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

          <button className={styles.primaryButton} disabled={!canCalculate} type="submit">
            Calcola
          </button>
        </form>

        <div className={styles.outputStack}>
          <ResultsPanel calculation={calculation} />
          <CalendarView calculation={calculation} />
        </div>
      </div>
    </main>
  );
}
