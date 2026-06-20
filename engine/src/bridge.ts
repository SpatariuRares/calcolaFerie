import type { DayType, ISODateString, WeekdayIndex } from "./types";

export interface Day {
  iso: ISODateString;
  weekday: WeekdayIndex;
  type: DayType;
  holidayName?: string;
}

export interface BridgeInterval {
  start: number;
  end: number;
  leva: number;
  stacco: number;
  cost: number;
  recommended: number[];
}

export function isFree(type: DayType): boolean {
  return type === "weekend" || type === "publicHoliday" || type === "companyClosure";
}

export function isScheduledWorkday(day: Day, workDays: Set<WeekdayIndex>): boolean {
  return workDays.has(day.weekday);
}

export function isWeekdayAnchor(day: Day, workDays: Set<WeekdayIndex>): boolean {
  return (
    (day.type === "publicHoliday" || day.type === "companyClosure") &&
    isScheduledWorkday(day, workDays)
  );
}

function hasScheduledRestDay(
  days: Day[],
  workDays: Set<WeekdayIndex>,
  start: number,
  end: number
): boolean {
  for (let i = start; i <= end; i++) {
    if (!isScheduledWorkday(days[i], workDays)) return true;
  }
  return false;
}

export function isValidBridgeInterval(
  days: Day[],
  workDays: Set<WeekdayIndex>,
  start: number,
  end: number,
  coverStart: number,
  coverEnd: number
): boolean {
  let hasRecommendedDay = false;
  for (let i = start; i <= end; i++) {
    if (days[i].type === "workday") {
      hasRecommendedDay = true;
      break;
    }
  }
  if (!hasRecommendedDay) return false;

  if (days[start].type === "workday" && start < coverStart) {
    let leftRunEnd = start;
    while (leftRunEnd + 1 <= end && days[leftRunEnd + 1].type === "workday") leftRunEnd++;

    if (leftRunEnd < coverStart) {
      let firstWeekdayAnchor = -1;
      for (let i = leftRunEnd + 1; i <= coverEnd; i++) {
        if (isWeekdayAnchor(days[i], workDays)) {
          firstWeekdayAnchor = i;
          break;
        }
      }

      if (firstWeekdayAnchor < 0) return false;
      if (!hasScheduledRestDay(days, workDays, leftRunEnd + 1, firstWeekdayAnchor - 1)) {
        return false;
      }
    }
  }

  if (days[end].type === "workday" && end > coverEnd) return false;

  return true;
}

/**
 * Best bridge interval covering day indices [coverStart, coverEnd], scanning the
 * left edge in [leftBound, coverStart] and the right edge in [coverEnd, rightBound].
 * Every workday inside the chosen interval becomes leave; the whole span is off.
 */
export function bestInterval(
  days: Day[],
  workDays: Set<WeekdayIndex>,
  consume: boolean,
  minBridgeLeverage: number,
  leftBound: number,
  coverStart: number,
  coverEnd: number,
  rightBound: number
): BridgeInterval | null {
  let best: BridgeInterval | null = null;

  for (let s = leftBound; s <= coverStart; s++) {
    for (let e = coverEnd; e <= rightBound; e++) {
      if (!isValidBridgeInterval(days, workDays, s, e, coverStart, coverEnd)) continue;

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
      if (leva < minBridgeLeverage) continue;

      const isBetterByLength =
        best === null ||
        stacco > best.stacco ||
        (stacco === best.stacco && cost < best.cost) ||
        (stacco === best.stacco && cost === best.cost && leva > best.leva) ||
        (stacco === best.stacco && cost === best.cost && leva === best.leva && s < best.start);

      if (isBetterByLength) {
        best = { start: s, end: e, leva, stacco, cost, recommended };
      }
    }
  }

  return best;
}
