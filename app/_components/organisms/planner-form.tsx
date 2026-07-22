"use client";

import { useId, type FormEvent } from "react";
import type { DayOff } from "@engine";
import type { PlannerConfig } from "../../_lib/user-config-url";
import type { DayOffRow } from "../planner-types";
import styles from "../../styles/app.module.scss";

const DAY_OFF_TYPE_LABELS: Record<DayOff["type"], string> = {
  companyClosure: "Chiusura aziendale — giorno gratuito",
  mandatoryLeave: "Giorno obbligatorio — scala dal budget",
};

export function PlannerForm({
  canCalculate,
  dayOffRows,
  onAddDayOff,
  onCopyLink,
  onDayOffDateChange,
  onDayOffTypeChange,
  onPatronSaintDateChange,
  onRemoveDayOff,
  onSubmit,
  onTotalVacationDaysChange,
  patronSaintDate,
  shareStatus,
  submittedConfig,
  totalVacationDays,
}: {
  canCalculate: boolean;
  dayOffRows: DayOffRow[];
  onAddDayOff: () => void;
  onCopyLink: () => void;
  onDayOffDateChange: (id: string, date: string) => void;
  onDayOffTypeChange: (id: string, type: DayOff["type"]) => void;
  onPatronSaintDateChange: (date: string) => void;
  onRemoveDayOff: (id: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTotalVacationDaysChange: (days: string) => void;
  patronSaintDate: string;
  shareStatus: string;
  submittedConfig: PlannerConfig | null;
  totalVacationDays: string;
}) {
  const budgetId = useId();
  const patronId = useId();

  return (
    <form className={styles.formPanel} onSubmit={onSubmit}>
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
          onChange={(event) => onTotalVacationDaysChange(event.target.value)}
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
                    onClick={() => onRemoveDayOff(row.id)}
                    type="button"
                  >
                    Rimuovi
                  </button>
                </div>
                <input
                  id={dateId}
                  className={styles.input}
                  onChange={(event) => onDayOffDateChange(row.id, event.target.value)}
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
                        onChange={() => onDayOffTypeChange(row.id, type)}
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

        <button className={styles.secondaryButton} onClick={onAddDayOff} type="button">
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
          onChange={(event) => onPatronSaintDateChange(event.target.value)}
          type="date"
          value={patronSaintDate}
        />
      </div>

      <div className={styles.submitActions}>
        <button className={styles.primaryButton} disabled={!canCalculate} type="submit">
          Calcola
        </button>
        {submittedConfig ? (
          <button className={styles.secondaryButton} onClick={onCopyLink} type="button">
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
  );
}
