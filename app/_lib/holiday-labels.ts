/**
 * Italian display labels for the locale-neutral keys emitted by the engine.
 * The engine knows only opaque string keys; all human-facing text lives here.
 */

export type HolidayKey =
  | "newYear"
  | "epiphany"
  | "liberation"
  | "labourDay"
  | "republic"
  | "assumption"
  | "allSaints"
  | "immaculateConception"
  | "christmas"
  | "stStephen"
  | "easterMonday"
  | "patron";

export const HOLIDAY_LABELS: Record<HolidayKey, string> = {
  newYear: "Capodanno",
  epiphany: "Epifania",
  liberation: "Festa della Liberazione",
  labourDay: "Festa dei Lavoratori",
  republic: "Festa della Repubblica",
  assumption: "Ferragosto",
  allSaints: "Ognissanti",
  immaculateConception: "Immacolata Concezione",
  christmas: "Natale",
  stStephen: "Santo Stefano",
  easterMonday: "Lunedì di Pasqua",
  patron: "Patrono locale",
};

export const COMPANY_CLOSURE_LABEL = "Chiusura aziendale";

/** Map a holiday key to its Italian label, falling back to the raw key if unknown. */
export function holidayLabel(key: string): string {
  return HOLIDAY_LABELS[key as HolidayKey] ?? key;
}
