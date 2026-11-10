import { formatInTimeZone, toDate } from "date-fns-tz";
import { addDays, differenceInCalendarDays, parseISO } from "date-fns";

export type WinStatusValue = "DONE" | "MINIMUM" | "MISSED";

export type ScoringWinCheck = {
  status: WinStatusValue;
};

export type ScoringEntry = {
  /** Calendar date as YYYY-MM-DD in the user's timezone */
  date: string;
  wakeTime: string | null;
  upByTarget: boolean;
  winChecks: ScoringWinCheck[];
};

/** Parse "HH:mm" to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time: ${time}`);
  }
  return hours * 60 + minutes;
}

/**
 * upByTarget = wakeTime <= targetWakeTime (minute precision).
 * Times are HH:mm strings already interpreted in the user's local day.
 */
export function isUpByTarget(
  wakeTime: string | null | undefined,
  targetWakeTime: string,
): boolean {
  if (!wakeTime) {
    return false;
  }
  return timeToMinutes(wakeTime) <= timeToMinutes(targetWakeTime);
}

export function maxDailyScore(winTypeCount: number): number {
  return 1 + winTypeCount;
}

/**
 * Daily score = (upByTarget ? 1 : 0) + count of DONE or MINIMUM.
 * Max = 1 + number of win types.
 */
export function dailyScore(
  entry: Pick<ScoringEntry, "upByTarget" | "winChecks">,
  winTypeCount: number,
): { score: number; max: number } {
  const winPoints = entry.winChecks.filter(
    (check) => check.status === "DONE" || check.status === "MINIMUM",
  ).length;
  const score = (entry.upByTarget ? 1 : 0) + winPoints;
  return { score, max: maxDailyScore(winTypeCount) };
}

export function scorePercent(score: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return score / max;
}

/** Today's calendar date YYYY-MM-DD in an IANA timezone. */
export function calendarDateInZone(instant: Date, timeZone: string): string {
  return formatInTimeZone(instant, timeZone, "yyyy-MM-dd");
}

/** Shift a YYYY-MM-DD calendar date by N days (date-only arithmetic). */
export function shiftCalendarDate(date: string, days: number): string {
  const base = parseISO(`${date}T12:00:00.000Z`);
  return formatInTimeZone(addDays(base, days), "UTC", "yyyy-MM-dd");
}

export function daysBetween(earlier: string, later: string): number {
  const a = parseISO(`${earlier}T12:00:00.000Z`);
  const b = parseISO(`${later}T12:00:00.000Z`);
  return differenceInCalendarDays(b, a);
}

function byDateAsc(a: ScoringEntry, b: ScoringEntry): number {
  return a.date.localeCompare(b.date);
}

/**
 * 5 AM streak = consecutive calendar days ending at the latest logged day
 * where upByTarget is true. A missing entry breaks the streak.
 * Also compute best streak across history.
 */
export function computeStreak(entries: ScoringEntry[]): {
  current: number;
  best: number;
} {
  if (entries.length === 0) {
    return { current: 0, best: 0 };
  }

  const sorted = [...entries].sort(byDateAsc);

  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    const entry = sorted[i];
    if (!entry.upByTarget) {
      run = 0;
      continue;
    }
    if (i > 0 && daysBetween(sorted[i - 1].date, entry.date) === 1 && run > 0) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  }

  const latest = sorted[sorted.length - 1];
  let current = 0;
  if (latest.upByTarget) {
    current = 1;
    for (let i = sorted.length - 2; i >= 0; i -= 1) {
      const entry = sorted[i];
      const next = sorted[i + 1];
      if (entry.upByTarget && daysBetween(entry.date, next.date) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, best };
}

/**
 * "Never miss twice": true when the last two consecutive calendar days
 * are both misses, OR when yesterday was a miss and today is not yet logged.
 * A miss is a logged day with upByTarget === false.
 */
export function neverMissTwice(
  entries: ScoringEntry[],
  today: string,
): boolean {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const yesterday = shiftCalendarDate(today, -1);
  const dayBefore = shiftCalendarDate(today, -2);

  const yesterdayEntry = byDate.get(yesterday);
  const todayEntry = byDate.get(today);
  const dayBeforeEntry = byDate.get(dayBefore);

  if (yesterdayEntry && !yesterdayEntry.upByTarget && !todayEntry) {
    return true;
  }

  if (
    todayEntry &&
    !todayEntry.upByTarget &&
    yesterdayEntry &&
    !yesterdayEntry.upByTarget
  ) {
    return true;
  }

  if (
    !todayEntry &&
    yesterdayEntry &&
    !yesterdayEntry.upByTarget &&
    dayBeforeEntry &&
    !dayBeforeEntry.upByTarget
  ) {
    return true;
  }

  return false;
}

/**
 * Weekly score % = sum of daily scores / (max * days logged).
 */
export function weeklyScorePercent(
  entriesInWeek: ScoringEntry[],
  winTypeCount: number,
): number {
  if (entriesInWeek.length === 0) {
    return 0;
  }
  const max = maxDailyScore(winTypeCount);
  const total = entriesInWeek.reduce(
    (sum, entry) => sum + dailyScore(entry, winTypeCount).score,
    0,
  );
  return total / (max * entriesInWeek.length);
}

/** 5 AM rate = days upByTarget / days logged. */
export function fiveAmRate(entries: ScoringEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }
  const hits = entries.filter((entry) => entry.upByTarget).length;
  return hits / entries.length;
}

export function computeUpByTarget(
  wakeTime: string | null | undefined,
  targetWakeTime: string,
): boolean {
  return isUpByTarget(wakeTime, targetWakeTime);
}

export function zonedCalendarDate(
  isoUtc: string,
  timeZone: string,
): string {
  return calendarDateInZone(toDate(isoUtc, { timeZone: "UTC" }), timeZone);
}
