import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { calendarDateInZone, shiftCalendarDate } from "@/lib/scoring";

/** Parse YYYY-MM-DD as a UTC noon Date for Prisma @db.Date storage. */
export function dateOnlyToUtc(date: string): Date {
  return parseISO(`${date}T12:00:00.000Z`);
}

export function utcDateToIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayInZone(timeZone: string, now = new Date()): string {
  return calendarDateInZone(now, timeZone);
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(`${date}T12:00:00.000Z`), "EEEE, d MMMM");
}

export function formatShortDay(date: string): string {
  return format(parseISO(`${date}T12:00:00.000Z`), "EEE d");
}

export function formatWakeDisplay(wakeTime: string | null | undefined): string {
  if (!wakeTime) {
    return "–:––";
  }
  const [h, m] = wakeTime.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${suffix}`;
}

/** Week starts on weekStartDay (0=Sun … 6=Sat). Returns Monday-style ISO dates. */
export function weekStartFor(
  date: string,
  weekStartDay: number,
): string {
  const base = parseISO(`${date}T12:00:00.000Z`);
  const start = startOfWeek(base, { weekStartsOn: weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  return format(start, "yyyy-MM-dd");
}

export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    shiftCalendarDate(weekStart, index),
  );
}

export function weekEnd(weekStart: string): string {
  return shiftCalendarDate(weekStart, 6);
}

export function formatWeekRange(weekStart: string): string {
  const start = parseISO(`${weekStart}T12:00:00.000Z`);
  const end = addDays(start, 6);
  return `${format(start, "d")} – ${format(end, "d MMM")}`;
}

export function weekNumberLabel(weekStart: string): string {
  const start = parseISO(`${weekStart}T12:00:00.000Z`);
  // Approximate ISO week from Monday-start weeks
  const oneJan = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));
  const days = Math.floor((start.getTime() - oneJan.getTime()) / 86400000);
  const week = Math.floor(days / 7) + 1;
  return `Week ${week}`;
}

export function nowTimeInZone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\u202f/g, "");
}

export { shiftCalendarDate };
