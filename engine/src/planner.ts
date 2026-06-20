import type {
  BridgeOpportunity,
  DayType,
  EngineInput,
  EngineOutput,
  ISODateString,
  WeekdayIndex,
} from "./types";
import { dateToISO, isoToDate } from "./date";
import {
  bestInterval,
  isFree,
  isWeekdayAnchor,
  type BridgeInterval,
  type Day,
} from "./bridge";

const CAP = 9; // max workday extension scanned on either edge of an anchor
const DEFAULT_MIN_BRIDGE_LEVERAGE = 2.1;

interface AnchorBlock {
  start: number; // day index
  end: number; // day index
}

export function calculatePlan(input: EngineInput): EngineOutput {
  const { windowStart, windowEnd, workSchedule, publicHolidays, daysOff, totalVacationDays } =
    input;
  const consume = workSchedule.consumeHolidaysOnPublicHolidays;
  const minBridgeLeverage = input.minBridgeLeverage ?? DEFAULT_MIN_BRIDGE_LEVERAGE;

  // --- 1. Build the day list and dayMap -------------------------------------
  const holidayKey = new Map<ISODateString, string>();
  for (const h of publicHolidays) holidayKey.set(h.date, h.key);

  const offType = new Map<ISODateString, "companyClosure" | "mandatoryLeave">();
  for (const o of daysOff) offType.set(o.date, o.type);

  const days: Day[] = [];
  const start = isoToDate(windowStart);
  const end = isoToDate(windowEnd);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = dateToISO(d);
    const weekday = d.getUTCDay() as WeekdayIndex;
    let type: DayType = workSchedule.workDays.has(weekday) ? "workday" : "weekend";
    if (holidayKey.has(iso)) type = "publicHoliday";
    const off = offType.get(iso);
    if (off) type = off;
    days.push({ iso, weekday, type, holidayKey: holidayKey.get(iso) });
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
      if (isWeekdayAnchor(days[i], workSchedule.workDays)) hasAnchor = true;
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

  type Cluster = { ai: number; aj: number; best: BridgeInterval | null };
  const bestFor = (ai: number, aj: number) =>
    bestInterval(
      days,
      workSchedule.workDays,
      consume,
      minBridgeLeverage,
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
    let pickBest: BridgeInterval | null = null;
    let pickScore = -Infinity;
    for (let k = 0; k < clusters.length - 1; k++) {
      const c1 = clusters[k];
      const c2 = clusters[k + 1];
      const fused = bestFor(c1.ai, c2.aj);
      if (!fused) continue;
      const partStacco = Math.max(c1.best ? c1.best.stacco : 0, c2.best ? c2.best.stacco : 0);
      if (fused.stacco > partStacco && fused.stacco > pickScore) {
        pick = k;
        pickBest = fused;
        pickScore = fused.stacco;
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
    const fusedHolidayKeys: string[] = [];
    for (let idx = b.start; idx <= b.end; idx++) {
      const day = days[idx];
      if (day.type === "publicHoliday") {
        if (!anchorDay || anchorDay.type !== "publicHoliday") anchorDay = day;
        if (day.holidayKey) fusedHolidayKeys.push(day.holidayKey);
      } else if (day.type === "companyClosure" && !anchorDay) {
        anchorDay = day;
      }
    }
    if (!anchorDay) continue;

    const anchorKind = anchorDay.type === "companyClosure" ? "companyClosure" : "publicHoliday";

    opportunities.push({
      id: `bridge-${days[b.start].iso}`,
      startDate: days[b.start].iso,
      endDate: days[b.end].iso,
      staccoDays: b.stacco,
      costDays: b.cost,
      leva: b.leva,
      recommendedDays,
      explanation: {
        anchorKind,
        ...(anchorKind === "publicHoliday" && anchorDay.holidayKey
          ? { anchorHolidayKey: anchorDay.holidayKey }
          : {}),
        anchorWeekday: anchorDay.weekday,
        costDays: b.cost,
        staccoDays: b.stacco,
        ...(fusedHolidayKeys.length > 1 ? { fusedHolidayKeys } : {}),
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
