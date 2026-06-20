export type {
  ISODateString,
  DayType,
  PublicHolidayKind,
  WeekdayIndex,
  PublicHoliday,
  WorkSchedule,
  DayOff,
  EngineInput,
  ExplanationData,
  BridgeOpportunity,
  EngineOutput,
  UserConfig,
} from "./types";
export { computeEaster, getItalianPublicHolidays, getPublicHolidaysForWindow } from "./holidays";

import type {
  ISODateString,
  DayType,
  WeekdayIndex,
  EngineInput,
  EngineOutput,
  BridgeOpportunity,
} from "./types";

const CAP = 9; // max workday extension scanned on either edge of an anchor

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoToUTC(iso: ISODateString): Date {
  return new Date(iso + "T00:00:00Z");
}

function utcToISO(d: Date): ISODateString {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

interface Day {
  iso: ISODateString;
  weekday: WeekdayIndex;
  type: DayType;
  holidayName?: string;
}

function isFree(type: DayType): boolean {
  return type === "weekend" || type === "publicHoliday" || type === "companyClosure";
}

/**
 * Best bridge interval covering day indices [coverStart, coverEnd], scanning the
 * left edge in [leftBound, coverStart] and the right edge in [coverEnd, rightBound].
 * Every workday inside the chosen interval becomes leave; the whole span is off.
 */
function bestInterval(
  days: Day[],
  consume: boolean,
  leftBound: number,
  coverStart: number,
  coverEnd: number,
  rightBound: number
) {
  let best: {
    start: number;
    end: number;
    leva: number;
    stacco: number;
    cost: number;
    recommended: number[];
  } | null = null;

  for (let s = leftBound; s <= coverStart; s++) {
    for (let e = coverEnd; e <= rightBound; e++) {
      const recommended: number[] = [];
      let holidayCount = 0;
      for (let i = s; i <= e; i++) {
        if (days[i].type === "workday") recommended.push(i);
        else if (days[i].type === "publicHoliday") holidayCount++;
      }
      const consumed = consume && recommended.length > 0 ? holidayCount : 0;
      const cost = recommended.length + consumed;
      if (cost < 1) continue; // no vacation spent -> not an opportunity
      const stacco = e - s + 1;
      const leva = stacco / cost;
      if (
        best === null ||
        leva > best.leva ||
        (leva === best.leva && stacco > best.stacco) ||
        (leva === best.leva && stacco === best.stacco && cost < best.cost) ||
        (leva === best.leva && stacco === best.stacco && cost === best.cost && s < best.start)
      ) {
        best = { start: s, end: e, leva, stacco, cost, recommended };
      }
    }
  }

  return best;
}

interface AnchorBlock {
  start: number; // day index
  end: number; // day index
}

export function calculatePlan(input: EngineInput): EngineOutput {
  const { windowStart, windowEnd, workSchedule, publicHolidays, daysOff, totalVacationDays } =
    input;
  const consume = workSchedule.consumeHolidaysOnPublicHolidays;

  // --- 1. Build the day list and dayMap -------------------------------------
  const holidayName = new Map<ISODateString, string>();
  for (const h of publicHolidays) holidayName.set(h.date, h.name);

  const offType = new Map<ISODateString, "companyClosure" | "mandatoryLeave">();
  for (const o of daysOff) offType.set(o.date, o.type);

  const days: Day[] = [];
  const start = isoToUTC(windowStart);
  const end = isoToUTC(windowEnd);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = utcToISO(d);
    const weekday = d.getUTCDay() as WeekdayIndex;
    let type: DayType = workSchedule.workDays.has(weekday) ? "workday" : "weekend";
    if (holidayName.has(iso)) type = "publicHoliday";
    const off = offType.get(iso);
    if (off) type = off;
    days.push({ iso, weekday, type, holidayName: holidayName.get(iso) });
  }

  const dayMap = new Map<ISODateString, DayType>();
  for (const day of days) dayMap.set(day.iso, day.type);

  // --- 2. Anchor blocks: free runs containing a holiday or closure ----------
  const anchors: AnchorBlock[] = [];
  let i = 0;
  while (i < days.length) {
    if (!isFree(days[i].type)) {
      i++;
      continue;
    }
    const runStart = i;
    let hasAnchor = false;
    while (i < days.length && isFree(days[i].type)) {
      if (days[i].type === "publicHoliday" || days[i].type === "companyClosure") hasAnchor = true;
      i++;
    }
    if (hasAnchor) anchors.push({ start: runStart, end: i - 1 });
  }

  // --- 3. Cluster bounds and best bridge per cluster ------------------------
  // A cluster spans anchors[ai..aj]; its edges may extend up to the midpoint of
  // the gap to the neighbouring anchor (so distinct opportunities never overlap).
  const leftBoundFor = (ai: number): number => {
    const coverStart = anchors[ai].start;
    if (ai === 0) return Math.max(0, coverStart - CAP);
    const gap = coverStart - anchors[ai - 1].end - 1;
    return Math.max(coverStart - Math.ceil(gap / 2), coverStart - CAP, 0);
  };
  const rightBoundFor = (aj: number): number => {
    const coverEnd = anchors[aj].end;
    if (aj === anchors.length - 1) return Math.min(days.length - 1, coverEnd + CAP);
    const gap = anchors[aj + 1].start - coverEnd - 1;
    return Math.min(coverEnd + Math.floor(gap / 2), coverEnd + CAP, days.length - 1);
  };

  type Cluster = { ai: number; aj: number; best: ReturnType<typeof bestInterval> };
  const bestFor = (ai: number, aj: number) =>
    bestInterval(
      days,
      consume,
      leftBoundFor(ai),
      anchors[ai].start,
      anchors[aj].end,
      rightBoundFor(aj)
    );

  const clusters: Cluster[] = anchors.map((_, idx) => ({
    ai: idx,
    aj: idx,
    best: bestFor(idx, idx),
  }));

  // --- 4. Agglomerative fusion: merge when fused leva >= both parts ----------
  let merged = true;
  while (merged && clusters.length > 1) {
    merged = false;
    let pick = -1;
    let pickBest: ReturnType<typeof bestInterval> = null;
    let pickScore = -Infinity;
    for (let k = 0; k < clusters.length - 1; k++) {
      const c1 = clusters[k];
      const c2 = clusters[k + 1];
      const fused = bestFor(c1.ai, c2.aj);
      if (!fused) continue;
      const parts = Math.max(c1.best ? c1.best.leva : 0, c2.best ? c2.best.leva : 0);
      if (fused.leva >= parts && fused.leva > pickScore) {
        pick = k;
        pickBest = fused;
        pickScore = fused.leva;
      }
    }
    if (pick >= 0) {
      const c1 = clusters[pick];
      const c2 = clusters[pick + 1];
      clusters.splice(pick, 2, { ai: c1.ai, aj: c2.aj, best: pickBest });
      merged = true;
    }
  }

  // --- 5. Build opportunities ----------------------------------------------
  const opportunities: BridgeOpportunity[] = [];
  for (const c of clusters) {
    const b = c.best;
    if (!b) continue;
    const recommendedDays = b.recommended.map((idx) => days[idx].iso);

    let anchorDay: Day | undefined;
    const fusedHolidayNames: string[] = [];
    for (let idx = b.start; idx <= b.end; idx++) {
      const day = days[idx];
      if (day.type === "publicHoliday") {
        if (!anchorDay || anchorDay.type !== "publicHoliday") anchorDay = day;
        if (day.holidayName) fusedHolidayNames.push(day.holidayName);
      } else if (day.type === "companyClosure" && !anchorDay) {
        anchorDay = day;
      }
    }
    if (!anchorDay) continue;

    opportunities.push({
      id: `bridge-${days[b.start].iso}`,
      startDate: days[b.start].iso,
      endDate: days[b.end].iso,
      staccoDays: b.stacco,
      costDays: b.cost,
      leva: b.leva,
      recommendedDays,
      explanation: {
        anchorHolidayName: anchorDay.holidayName ?? "Chiusura aziendale",
        anchorWeekday: anchorDay.weekday,
        costDays: b.cost,
        staccoDays: b.stacco,
        ...(fusedHolidayNames.length > 1 ? { fusedHolidayNames } : {}),
      },
    });

    for (const iso of recommendedDays) dayMap.set(iso, "recommendedLeave");
  }

  opportunities.sort((a, b) => a.startDate.localeCompare(b.startDate));

  // --- 6. Budget -----------------------------------------------------------
  const mandatoryCount = daysOff.filter(
    (o) => o.type === "mandatoryLeave" && o.date >= windowStart && o.date <= windowEnd
  ).length;
  const availableBudget = totalVacationDays - mandatoryCount;

  return { opportunities, dayMap, availableBudget };
}
