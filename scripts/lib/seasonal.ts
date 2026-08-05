import {
  addDays,
  dateToISO,
  getItalianPublicHolidays,
  isScheduledWorkday,
  isWeekdayAnchor,
  isoToDate,
  type Day,
  type ISODateString,
  type PublicHoliday,
  type WeekdayIndex,
} from "@engine";

export const WORK_DAYS = new Set<WeekdayIndex>([1, 2, 3, 4, 5]);

export const WEEKDAY_IT = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
] as const;

export const MONTHS_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

export const HOLIDAY_LABELS: Record<string, string> = {
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
  easterMonday: "Lunedì dell'Angelo",
};

export const SLUG_LABELS: Record<string, string> = {
  newYear: "capodanno",
  epiphany: "epifania",
  liberation: "25-aprile",
  labourDay: "1-maggio",
  republic: "2-giugno",
  assumption: "ferragosto",
  allSaints: "ognissanti",
  immaculateConception: "immacolata",
  christmas: "natale",
  stStephen: "santo-stefano",
  easterMonday: "pasquetta",
};

export interface LocalBridge {
  startDate: ISODateString;
  endDate: ISODateString;
  leva: number;
  staccoDays: number;
  costDays: number;
  recommendedDays: ISODateString[];
}

export function parseYear(raw: string | undefined): number {
  if (!raw) {
    throw new Error("Passa un anno come argomento, es: pnpm generate:seasonal 2027");
  }
  if (/^\d{2}$/.test(raw)) {
    return 2000 + parseInt(raw, 10);
  }
  const year = parseInt(raw, 10);
  if (!Number.isInteger(year)) {
    throw new Error(`Anno non valido: ${raw}`);
  }
  return year;
}

export function weekdayIndex(iso: ISODateString): WeekdayIndex {
  return isoToDate(iso).getUTCDay() as WeekdayIndex;
}

export function isWeekend(iso: ISODateString): boolean {
  const wd = weekdayIndex(iso);
  return wd === 0 || wd === 6;
}

export function formatItalianDate(iso: ISODateString): string {
  const d = isoToDate(iso);
  return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]}`;
}

export function holidayLabel(key: string): string {
  return HOLIDAY_LABELS[key] ?? key;
}

export function slugKeyFor(holiday: PublicHoliday): string {
  return SLUG_LABELS[holiday.key] ?? holiday.key;
}

// Compute the highest-leverage bridge that covers a single weekday holiday.
export function bestBridgeFor(holiday: PublicHoliday): LocalBridge {
  const windowStart = addDays(holiday.date, -7);
  const windowEnd = addDays(holiday.date, 7);

  const holidays = new Map<ISODateString, string>();
  holidays.set(holiday.date, holiday.key);

  const days: Day[] = [];
  let cursor = windowStart;
  while (cursor <= windowEnd) {
    const weekday = isoToDate(cursor).getUTCDay() as WeekdayIndex;
    let type: Day["type"] = WORK_DAYS.has(weekday) ? "workday" : "weekend";
    if (holidays.has(cursor)) type = "publicHoliday";
    days.push({ iso: cursor, weekday, type, holidayKey: holidays.get(cursor) });
    cursor = addDays(cursor, 1);
  }

  const idx = days.findIndex((d) => d.iso === holiday.date);
  let best: LocalBridge | null = null;

  for (let s = 0; s <= idx; s++) {
    for (let e = idx; e < days.length; e++) {
      const segment = days.slice(s, e + 1);
      const hasAnchor = segment.some((d) => isWeekdayAnchor(d, WORK_DAYS));
      const hasRestDay = segment.some((d) => !isScheduledWorkday(d, WORK_DAYS));
      if (!hasAnchor || !hasRestDay) continue;

      const recommendedDays = segment
        .filter((d) => d.type === "workday")
        .map((d) => d.iso);
      const cost = recommendedDays.length;
      const staccoDays = e - s + 1;
      if (cost === 0) continue;
      const leva = staccoDays / cost;

      const better =
        best === null ||
        leva > best.leva ||
        (leva === best.leva &&
          (cost < best.costDays ||
            (cost === best.costDays && staccoDays > best.staccoDays)));
      if (better) {
        best = {
          startDate: days[s].iso,
          endDate: days[e].iso,
          leva,
          staccoDays,
          costDays: cost,
          recommendedDays,
        };
      }
    }
  }

  if (!best) {
    throw new Error(`Nessun ponte valido per ${holiday.key} (${holiday.date})`);
  }
  return best;
}

export function buildTableRows(opp: LocalBridge): string {
  const rows: string[] = [];
  let cursor = opp.startDate;
  while (cursor <= opp.endDate) {
    const isRec = opp.recommendedDays.includes(cursor);
    const label = isRec
      ? "ferie da chiedere"
      : isWeekend(cursor)
        ? "weekend libero"
        : "festività nazionale";
    rows.push(`| ${WEEKDAY_IT[weekdayIndex(cursor)]} | ${formatItalianDate(cursor)} | ${label} |`);
    cursor = addDays(cursor, 1);
  }
  return rows.join("\n");
}

export function formatLeva(leva: number): string {
  return leva.toFixed(2).replace(/\.?0+$/, "");
}

export function slugFor(holiday: PublicHoliday): string {
  const d = isoToDate(holiday.date);
  const key = slugKeyFor(holiday);
  return `ponte-${key}-${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

/** Parse a generated slug back into a holiday, or null when it isn't one of ours. */
export function parseGeneratedSlug(slug: string): PublicHoliday | null {
  const match = /^ponte-([a-z0-9-]+)-(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(slug);
  if (!match) return null;
  const [, key, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const holiday = getItalianPublicHolidays(year).find(
    (h) =>
      h.date === `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  );
  return holiday && slugKeyFor(holiday) === key ? holiday : null;
}

export function buildPost(holiday: PublicHoliday, opp: LocalBridge, date?: ISODateString): string {
  const label = holidayLabel(holiday.key);
  const year = holiday.date.slice(0, 4);
  const daysNoun = opp.costDays === 1 ? "giorno" : "giorni";
  const title = `Ponte di ${label} ${year}: ${opp.staccoDays} giorni liberi con ${opp.costDays} ${daysNoun} di ferie`;
  const description = `Come organizzare il ponte di ${label} ${year}: calendario preciso, ferie da chiedere, leva reale e strategia per non sprecare giorni di ferie.`;
  const recommended = opp.recommendedDays
    .map((d) => `${WEEKDAY_IT[weekdayIndex(d)]} ${formatItalianDate(d)}`)
    .join(", ");
  const rientro = addDays(opp.endDate, 1);
  const table = buildTableRows(opp);
  const leva = formatLeva(opp.leva);
  const rientroLine =
    opp.endDate >= opp.startDate
      ? `Il rientro è previsto per **${WEEKDAY_IT[weekdayIndex(rientro)]} ${formatItalianDate(rientro)}**. Programma il rientro per non ripartire di corsa.`
      : "";

  return `---
title: "${title}"
description: "${description}"
date: "${date ?? dateToISO(new Date())}"
expiresAt: "${opp.endDate}"
---

Il ponte di ${label} nel ${year} è uno dei punti più convenienti del calendario: con ${opp.costDays} ${daysNoun} di ferie ottieni **${opp.staccoDays} giorni consecutivi di stacco**, uno dei rendimenti migliori dell'anno.

Il calendario è questo:

| Giorno | Data | Cosa succede |
| :--- | :--- | :--- |
${table}

## La combinazione migliore

Ferie da chiedere: **${recommended}**.

\`\`\`text
${opp.staccoDays} giorni liberi / ${opp.costDays} ${daysNoun} di ferie = leva ${leva}x
\`\`\`

${rientroLine}

## Consigli pratici

- **Chiedi le ferie presto**: ${label} è un ponte molto richiesto, e in azienda i giorni vengono spesso assegnati in ordine di richiesta.
- **Controlla il tuo calendario**: se la tua azienda chiude in quei giorni, o se il patrono locale cade vicino, la leva può migliorare ulteriormente.
- **Se lavori su turni**: sabato e domenica non sono automaticamente liberi. Ricalcola il ponte sul tuo piano turni effettivo prima di chiedere ferie.

Governare il proprio piano ferie significa scegliere i ponti che danno la leva più alta possibile. [Apri il calcolatore](/), inserisci il tuo budget e confronta ${label} con gli altri ponti del ${year} prima di decidere.
`;
}
