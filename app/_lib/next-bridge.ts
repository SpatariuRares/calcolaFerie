import {
  calculatePlan,
  isoToDate,
  localToday,
  type BridgeOpportunity,
  type UserConfig,
} from "@engine";
import { buildEngineInput } from "./engine-input";

// Configurazione neutra: nessuna chiusura/patrono, budget ampio così l'elenco
// delle opportunità non viene filtrato dal monte ferie. Le opportunità dipendono
// solo dal calendario delle festività, quindi il risultato è deterministico.
const DEFAULT_CONFIG: UserConfig = {
  totalVacationDays: 30,
  daysOff: [],
};

const MS_PER_DAY = 86_400_000;

export interface NextBridge {
  opportunity: BridgeOpportunity;
  /**
   * Chiave i18n della festività àncora (namespace `holidays`), es.
   * "immaculateConception". Per le chiusure aziendali vale "companyClosure".
   */
  holidayKey: string;
  /** Giorni mancanti all'inizio del ponte; 0 se già in corso. */
  daysUntilStart: number;
}

let cachedDateIso: string | null = null;
let cachedBridge: NextBridge | null = null;

/**
 * Primo ponte utile a partire da oggi, calcolato dall'engine sul calendario
 * ufficiale delle festività italiane. Restituisce `null` se non ce ne sono
 * nella finestra corrente.
 */
export function getNextBridge(today: Date = new Date()): NextBridge | null {
  const todayIso = localToday(today);
  if (cachedDateIso === todayIso) {
    return cachedBridge;
  }

  const input = buildEngineInput(DEFAULT_CONFIG, today);
  const { opportunities } = calculatePlan(input);

  const upcoming = opportunities.find((o) => o.endDate >= todayIso);
  if (!upcoming) {
    cachedDateIso = todayIso;
    cachedBridge = null;
    return null;
  }

  // Le opportunità hanno sempre un'àncora: festività (con chiave) o chiusura.
  const holidayKey = upcoming.explanation.anchorHolidayKey ?? "companyClosure";

  const startMs = isoToDate(upcoming.startDate).getTime();
  const todayMs = isoToDate(todayIso).getTime();
  const daysUntilStart = Math.max(0, Math.round((startMs - todayMs) / MS_PER_DAY));

  cachedBridge = { opportunity: upcoming, holidayKey, daysUntilStart };
  cachedDateIso = todayIso;
  return cachedBridge;
}
