import { type BridgeOpportunity, type WeekdayIndex } from "@engine";
import { companyClosureLabel, holidayLabel, type HolidayTranslator } from "./holiday-labels";

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
