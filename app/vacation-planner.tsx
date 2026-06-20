"use client";

import { useId, useRef, useState } from "react";
import { type DayOff } from "@/engine/src/index";
import { calculateVacationPlan, type CalculationState } from "./calculate-vacation-plan";
import styles from "./page.module.css";
import { ResultsTable } from "./results-table";

type DayOffRow = DayOff & { id: string };

const DAY_OFF_TYPE_LABELS: Record<DayOff["type"], string> = {
  companyClosure: "Chiusura aziendale — giorno gratuito",
  mandatoryLeave: "Giorno obbligatorio — scala dal budget",
};

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

function ResultsPlaceholder({ calculation }: { calculation: CalculationState | null }) {
  return (
    <section className={styles.outputSection} aria-labelledby="results-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Risultati</p>
        <h2 id="results-title">Ponti consigliati</h2>
      </div>
      {calculation ? (
        <ResultsTable output={calculation.output} />
      ) : (
        <p className={styles.mutedText}>Compila il form e premi Calcola per vedere la tabella.</p>
      )}
    </section>
  );
}

function CalendarPlaceholder({ calculation }: { calculation: CalculationState | null }) {
  return (
    <section className={styles.outputSection} aria-labelledby="calendar-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Calendario</p>
        <h2 id="calendar-title">Vista annuale</h2>
      </div>
      {calculation ? (
        <div className={styles.placeholder}>
          <strong>{calculation.output.dayMap.size}</strong>
          <span>
            giorni classificati dal {calculation.input.windowStart} al {calculation.input.windowEnd}
            .
          </span>
        </div>
      ) : (
        <p className={styles.mutedText}>Il calendario riceverà i dati dopo il primo calcolo.</p>
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
        <p className={styles.eyebrow}>Planner ferie</p>
        <h1 id="page-title">CalcolaFerie</h1>
        <p>
          Inserisci budget, chiusure e patrono locale. Il calcolo parte solo quando premi il
          pulsante.
        </p>
      </section>

      <div className={styles.toolLayout}>
        <form className={styles.formPanel} onSubmit={handleSubmit}>
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
          <ResultsPlaceholder calculation={calculation} />
          <CalendarPlaceholder calculation={calculation} />
        </div>
      </div>
    </main>
  );
}
