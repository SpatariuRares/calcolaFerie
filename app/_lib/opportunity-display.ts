import { type BridgeOpportunity, type WeekdayIndex } from "@engine";
import { COMPANY_CLOSURE_LABEL, holidayLabel } from "./holiday-labels";

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

export function formatDateRange(startDate: string, endDate: string) {
  const start = parseISODateParts(startDate);
  const end = parseISODateParts(endDate);
  const startMonth = MONTH_LABELS[start.month - 1];
  const endMonth = MONTH_LABELS[end.month - 1];

  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${endMonth}`;
  }

  if (start.year === end.year) {
    return `${start.day} ${startMonth}–${end.day} ${endMonth}`;
  }

  return `${start.day} ${startMonth} ${start.year}–${end.day} ${endMonth} ${end.year}`;
}

export function formatExplanation(opportunity: BridgeOpportunity) {
  const { explanation } = opportunity;
  const costDays = explanation.costDays;
  const staccoDays = explanation.staccoDays;

  if (costDays === 0) {
    return "Nessuna feria necessaria — blocco già libero";
  }

  const costPhrase = `${costDays} ${vacationDayLabel(costDays)} di ferie`;
  const resultPhrase = `${costPhrase} = ${staccoDays} giorni di stacco`;

  if (explanation.fusedHolidayKeys && explanation.fusedHolidayKeys.length > 1) {
    return `${explanation.fusedHolidayKeys.map(holidayLabel).join(" + ")} → ${resultPhrase}`;
  }

  const anchorLabel =
    explanation.anchorKind === "companyClosure"
      ? COMPANY_CLOSURE_LABEL
      : holidayLabel(explanation.anchorHolidayKey ?? "");

  return `${anchorLabel} cade ${WEEKDAY_LABELS[explanation.anchorWeekday]} → ${resultPhrase}`;
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
