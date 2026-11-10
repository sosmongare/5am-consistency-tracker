import type { DailyEntry, WinCheck, WinType, WeeklyReview } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  dateOnlyToUtc,
  todayInZone,
  utcDateToIso,
  weekDates,
  weekStartFor,
} from "@/lib/dates";
import {
  computeStreak,
  dailyScore,
  fiveAmRate,
  isUpByTarget,
  neverMissTwice,
  shiftCalendarDate,
  weeklyScorePercent,
  type ScoringEntry,
} from "@/lib/scoring";

export type DailyEntryWithWins = DailyEntry & {
  winChecks: WinCheck[];
};

export function toScoringEntry(entry: DailyEntryWithWins): ScoringEntry {
  return {
    date: utcDateToIso(entry.date),
    wakeTime: entry.wakeTime,
    upByTarget: entry.upByTarget,
    winChecks: entry.winChecks.map((check) => ({ status: check.status })),
  };
}

export async function getEntriesInRange(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<DailyEntryWithWins[]> {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      date: {
        gte: dateOnlyToUtc(fromDate),
        lte: dateOnlyToUtc(toDate),
      },
    },
    include: { winChecks: true },
    orderBy: { date: "asc" },
  });
}

export async function getTodayPageData(userId: string, timeZone: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      settings: true,
      winTypes: { orderBy: { sortOrder: "asc" } },
    },
  });

  const settings = user.settings!;
  const winTypes = user.winTypes;
  const today = todayInZone(timeZone);
  const lookbackStart = shiftCalendarDate(today, -60);

  const entries = await getEntriesInRange(userId, lookbackStart, today);
  const byDate = new Map(
    entries.map((entry) => [utcDateToIso(entry.date), entry] as const),
  );
  const todayEntry = byDate.get(today) ?? null;
  const scoring = entries.map(toScoringEntry);
  const streak = computeStreak(scoring);
  const showNeverMissTwice = neverMissTwice(scoring, today);

  const winTypeCount = winTypes.length;
  const score = todayEntry
    ? dailyScore(toScoringEntry(todayEntry), winTypeCount)
    : { score: 0, max: 1 + winTypeCount };

  return {
    today,
    settings,
    winTypes,
    todayEntry,
    streak,
    showNeverMissTwice,
    score,
  };
}

export async function getWeekPageData(userId: string, timeZone: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      settings: true,
      winTypes: { orderBy: { sortOrder: "asc" } },
    },
  });

  const settings = user.settings!;
  const winTypes = user.winTypes;
  const today = todayInZone(timeZone);
  const weekStart = weekStartFor(today, settings.weekStartDay);
  const dates = weekDates(weekStart);
  const weekEndDate = dates[6];

  const entries = await getEntriesInRange(userId, weekStart, weekEndDate);
  const byDate = new Map(
    entries.map((entry) => [utcDateToIso(entry.date), entry] as const),
  );

  const scoring = entries.map(toScoringEntry);
  const winTypeCount = winTypes.length;
  const weekScore = weeklyScorePercent(scoring, winTypeCount);
  const amRate = fiveAmRate(scoring);
  const fiveAmDays = scoring.filter((entry) => entry.upByTarget).length;

  const review = await prisma.weeklyReview.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart: dateOnlyToUtc(weekStart),
      },
    },
  });

  const dayRows = dates.map((date) => {
    const entry = byDate.get(date) ?? null;
    const scored = entry
      ? dailyScore(toScoringEntry(entry), winTypeCount)
      : null;
    return {
      date,
      entry,
      score: scored?.score ?? null,
      max: 1 + winTypeCount,
      isToday: date === today,
      isFuture: date > today,
    };
  });

  return {
    today,
    weekStart,
    weekEndDate,
    settings,
    winTypes,
    review,
    dayRows,
    weekScore,
    fiveAmDays,
    fiveAmTarget: settings.weekly5amTarget,
    amRate,
    reviewEditable: today >= weekEndDate,
  };
}

export { isUpByTarget };

export type { WinType, WeeklyReview };
