import { daysBetween } from "@/lib/scoring";

/**
 * Past days can be logged/edited for up to 3 days back from Today.
 * Older entries are read-only unless edited from History (Phase 3).
 */
export function canEditFromToday(
  entryDate: string,
  today: string,
  fromHistory = false,
): boolean {
  if (fromHistory) {
    return true;
  }
  const delta = daysBetween(entryDate, today);
  return delta >= 0 && delta <= 3;
}
