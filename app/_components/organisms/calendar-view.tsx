import { isoToDate, type ISODateString } from "@engine";
import { useRef } from "react";
import {
  buildCalendarMonths,
  CALENDAR_LEGEND,
  DAY_TYPE_LABELS,
  getCalendarDayLabel,
  isSelectableVacationDay,
} from "../../_lib/calendar-model";
import { type CalculationState } from "../../_lib/calculate-vacation-plan";
import { formatDateRange } from "../../_lib/opportunity-display";
import { useAppLocale, useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export type SelectedVacationRange = {
  start: ISODateString;
  end: ISODateString;
  days: number;
};

function formatSingleDay(iso: ISODateString, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "it-IT", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(isoToDate(iso));
}

export function buildSelectedRanges(
  selectableIsoDates: ISODateString[],
  selected: Set<string>
): SelectedVacationRange[] {
  const ranges: SelectedVacationRange[] = [];
  let previousIndex = -2;

  selectableIsoDates.forEach((iso, index) => {
    if (!selected.has(iso)) return;
    const last = ranges[ranges.length - 1];
    if (last && index === previousIndex + 1) {
      last.end = iso;
      last.days += 1;
    } else {
      ranges.push({ start: iso, end: iso, days: 1 });
    }
    previousIndex = index;
  });

  return ranges;
}

function formatSelectedRangeLabel(range: SelectedVacationRange, locale: string) {
  return range.start === range.end
    ? formatSingleDay(range.start, locale)
    : formatDateRange(range.start, range.end, locale);
}

export function CalendarView({
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
  const t = useAppTranslations("calendar");
  const holidayTranslations = useAppTranslations("holidays");
  const locale = useAppLocale();
  const anchorDateRef = useRef<ISODateString | null>(null);
  const dayTypeLabels = Object.fromEntries(
    CALENDAR_LEGEND.map((type) => [type, t(`dayTypes.${type}`)])
  ) as typeof DAY_TYPE_LABELS;
  const months = calculation
    ? buildCalendarMonths(calculation.input, calculation.output, {
        locale,
        holidayLabel: (key) => holidayTranslations(key as never),
      })
    : [];
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
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="calendar-title">{t("title")}</h2>
        </div>
      </div>

      <div className={styles.legend} aria-label={t("legendAria")}>
        {CALENDAR_LEGEND.map((type) => (
          <span className={styles.legendItem} key={type}>
            <span className={`${styles.legendSwatch} ${styles[`dayCell_${type}`]}`} />
            {dayTypeLabels[type]}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.dayCellSelected}`} />
          {t("selectedLeave")}
        </span>
      </div>

      {calculation ? (
        <>
          <div className={styles.selectedVacationBar}>
            <div>
              <strong>{t("selectionCount", { count: selectedVacationDates.size })}</strong>
              <span>
                {selectedRanges.length > 0
                  ? selectedRanges
                      .map((range) => formatSelectedRangeLabel(range, locale))
                      .join(", ")
                  : t("selectionHelp")}
              </span>
            </div>
            {selectedVacationDates.size > 0 ? (
              <button
                className={styles.clearSelectionButton}
                onClick={onClearSelectedVacationDates}
                type="button"
              >
                {t("clear")}
              </button>
            ) : null}
          </div>

          <div className={styles.calendarList}>
            {months.map((month) => (
              <article className={styles.monthBlock} key={month.key}>
                <h3>{month.label}</h3>
                <div className={styles.weekdayGrid} aria-hidden="true">
                  {t.raw("weekdaysShort").map((weekday: string, index: number) => (
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
                    const baseLabel = getCalendarDayLabel(day, { locale, dayTypeLabels });
                    const label = isSelected
                      ? `${baseLabel} — ${t("selectedAriaSuffix")}`
                      : baseLabel;
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
          <strong>{t("emptyTitle")}</strong>
          <span>{t("emptyDescription")}</span>
        </div>
      )}
    </section>
  );
}
