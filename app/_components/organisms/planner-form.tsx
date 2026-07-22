"use client";

import { useId, type FormEvent } from "react";
import type { DayOff } from "@engine";
import { MAX_VACATION_DAYS, type PlannerConfig } from "../../_lib/user-config-url";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import type { DayOffRow } from "../planner-types";
import styles from "../../styles/app.module.scss";

export function PlannerForm({
  canCalculate,
  currentYear,
  dayOffRows,
  onAddDayOff,
  onCopyLink,
  onDayOffDateChange,
  onDayOffTypeChange,
  onPatronSaintDateChange,
  onPlanningYearChange,
  onRemoveDayOff,
  onSubmit,
  onTotalVacationDaysChange,
  patronSaintDate,
  planningYear,
  shareStatus,
  submittedConfig,
  totalVacationDays,
}: {
  canCalculate: boolean;
  currentYear: number;
  dayOffRows: DayOffRow[];
  onAddDayOff: () => void;
  onCopyLink: () => void;
  onDayOffDateChange: (id: string, date: string) => void;
  onDayOffTypeChange: (id: string, type: DayOff["type"]) => void;
  onPatronSaintDateChange: (date: string) => void;
  onPlanningYearChange: (year: number) => void;
  onRemoveDayOff: (id: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTotalVacationDaysChange: (days: string) => void;
  patronSaintDate: string;
  planningYear: number;
  shareStatus: string;
  submittedConfig: PlannerConfig | null;
  totalVacationDays: string;
}) {
  const t = useAppTranslations("planner");
  const dayOffTypes: DayOff["type"][] = ["companyClosure", "mandatoryLeave"];
  const budgetId = useId();
  const yearId = useId();
  const patronId = useId();

  return (
    <form className={styles.formPanel} onSubmit={onSubmit}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>{t("form.eyebrow")}</p>
        <h2>{t("form.title")}</h2>
      </div>

      <div className={styles.primaryFields}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={budgetId}>
            {t("form.budget")}
          </label>
          <input
            id={budgetId}
            className={styles.input}
            inputMode="numeric"
            max={MAX_VACATION_DAYS}
            min="0"
            name="totalVacationDays"
            onChange={(event) => onTotalVacationDaysChange(event.target.value)}
            placeholder={t("form.budgetPlaceholder")}
            required
            step="1"
            type="number"
            value={totalVacationDays}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={yearId}>
            {t("form.year")}
          </label>
          <select
            id={yearId}
            className={styles.input}
            name="planningYear"
            onChange={(event) => onPlanningYearChange(Number(event.target.value))}
            value={planningYear}
          >
            {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details className={styles.advancedSearch}>
        <summary>{t("form.advanced")}</summary>
        <div className={styles.advancedSearchContent}>
          <fieldset className={styles.fieldset}>
            <legend>{t("form.daysOffTitle")}</legend>
            <p className={styles.helpText}>{t("form.daysOffHelp")}</p>

            <div className={styles.dayOffList}>
              {dayOffRows.map((row, index) => {
                const dateId = `day-off-date-${row.id}`;
                const radioName = `day-off-type-${row.id}`;

                return (
                  <div className={styles.dayOffRow} key={row.id}>
                    <div className={styles.dayOffTopLine}>
                      <label className={styles.label} htmlFor={dateId}>
                        {t("form.date", { number: index + 1 })}
                      </label>
                      <button
                        className={styles.linkButton}
                        onClick={() => onRemoveDayOff(row.id)}
                        type="button"
                      >
                        {t("form.remove")}
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
                      aria-label={t("form.dayTypeAria", { number: index + 1 })}
                    >
                      {dayOffTypes.map((type) => (
                        <label className={styles.segment} key={type}>
                          <input
                            checked={row.type === type}
                            name={radioName}
                            onChange={() => onDayOffTypeChange(row.id, type)}
                            type="radio"
                            value={type}
                          />
                          <span>{t(`dayOffTypes.${type}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className={styles.secondaryButton} onClick={onAddDayOff} type="button">
              {t("form.addDate")}
            </button>
          </fieldset>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={patronId}>
              {t("form.patron")}
            </label>
            <input
              id={patronId}
              className={styles.input}
              onChange={(event) => onPatronSaintDateChange(event.target.value)}
              type="date"
              value={patronSaintDate}
            />
          </div>
        </div>
      </details>

      <div className={styles.submitActions}>
        <button className={styles.primaryButton} disabled={!canCalculate} type="submit">
          {t("form.calculate")}
        </button>
        {submittedConfig ? (
          <button className={styles.secondaryButton} onClick={onCopyLink} type="button">
            {t("form.copyLink")}
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
