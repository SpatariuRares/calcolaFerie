/** Locale-neutral holiday keys emitted by the engine. */
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
export type HolidayTranslator = (key: string) => string;

export function holidayLabel(key: string, translate?: HolidayTranslator): string {
  if (translate && key in HOLIDAY_LABELS) return translate(key);
  return HOLIDAY_LABELS[key as HolidayKey] ?? key;
}

export function companyClosureLabel(translate?: HolidayTranslator): string {
  return translate ? translate("companyClosure") : COMPANY_CLOSURE_LABEL;
}
