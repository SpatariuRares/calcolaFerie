import {
  buildCalendarMonths,
  CALENDAR_LEGEND,
  DAY_TYPE_LABELS,
  getCalendarDayLabel,
  isSelectableVacationDay,
} from "../../_lib/calendar-model";
import { type CalculationState } from "../../_lib/calculate-vacation-plan";
import styles from "../../styles/app.module.scss";

const WEEKDAY_INITIALS = ["L", "M", "M", "G", "V", "S", "D"];

export function CalendarView({
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
