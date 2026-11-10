import { describe, expect, it } from "vitest";
import {
  calendarDateInZone,
  computeStreak,
  dailyScore,
  fiveAmRate,
  isUpByTarget,
  neverMissTwice,
  scorePercent,
  shiftCalendarDate,
  weeklyScorePercent,
  zonedCalendarDate,
  type ScoringEntry,
} from "./scoring";

function entry(
  date: string,
  upByTarget: boolean,
  statuses: Array<"DONE" | "MINIMUM" | "MISSED"> = [],
  wakeTime: string | null = upByTarget ? "04:50" : "06:00",
): ScoringEntry {
  return {
    date,
    wakeTime,
    upByTarget,
    winChecks: statuses.map((status) => ({ status })),
  };
}

describe("isUpByTarget", () => {
  it("counts wake at or before target", () => {
    expect(isUpByTarget("05:00", "05:00")).toBe(true);
    expect(isUpByTarget("04:59", "05:00")).toBe(true);
    expect(isUpByTarget("04:00", "05:00")).toBe(true);
  });

  it("rejects wake one minute after target", () => {
    expect(isUpByTarget("05:01", "05:00")).toBe(false);
  });

  it("rejects missing wake time", () => {
    expect(isUpByTarget(null, "05:00")).toBe(false);
    expect(isUpByTarget(undefined, "05:00")).toBe(false);
  });
});

describe("dailyScore", () => {
  const winTypeCount = 4;

  it("scores upByTarget plus DONE and MINIMUM", () => {
    const result = dailyScore(
      entry("2026-11-10", true, ["DONE", "MINIMUM", "MISSED", "DONE"]),
      winTypeCount,
    );
    // 1 (wake) + 3 (DONE/MINIMUM) = 4; max = 5
    expect(result).toEqual({ score: 4, max: 5 });
    expect(scorePercent(result.score, result.max)).toBe(0.8);
  });

  it("scores zero wake and zero wins", () => {
    const result = dailyScore(entry("2026-11-10", false, []), winTypeCount);
    expect(result).toEqual({ score: 0, max: 5 });
  });

  it("treats MISSED as zero points", () => {
    const result = dailyScore(
      entry("2026-11-10", false, ["MISSED", "MISSED", "MISSED", "MISSED"]),
      winTypeCount,
    );
    expect(result.score).toBe(0);
  });
});

describe("computeStreak", () => {
  it("returns zeros for empty history", () => {
    expect(computeStreak([])).toEqual({ current: 0, best: 0 });
  });

  it("builds a current streak ending at the latest logged day", () => {
    const entries = [
      entry("2026-11-07", true),
      entry("2026-11-08", true),
      entry("2026-11-09", true),
      entry("2026-11-10", true),
    ];
    expect(computeStreak(entries)).toEqual({ current: 4, best: 4 });
  });

  it("breaks current streak on a miss at the latest day", () => {
    const entries = [
      entry("2026-11-08", true),
      entry("2026-11-09", true),
      entry("2026-11-10", false),
    ];
    expect(computeStreak(entries).current).toBe(0);
    expect(computeStreak(entries).best).toBe(2);
  });

  it("breaks streak on a missing calendar day", () => {
    const entries = [
      entry("2026-11-07", true),
      entry("2026-11-08", true),
      // gap on 2026-11-09
      entry("2026-11-10", true),
    ];
    const result = computeStreak(entries);
    expect(result.current).toBe(1);
    expect(result.best).toBe(2);
  });

  it("tracks best streak across history", () => {
    const entries = [
      entry("2026-11-01", true),
      entry("2026-11-02", true),
      entry("2026-11-03", true),
      entry("2026-11-04", false),
      entry("2026-11-05", true),
      entry("2026-11-06", true),
    ];
    expect(computeStreak(entries)).toEqual({ current: 2, best: 3 });
  });
});

describe("neverMissTwice", () => {
  const today = "2026-11-11";

  it("alerts when yesterday was a miss and today is not logged", () => {
    const entries = [entry("2026-11-10", false)];
    expect(neverMissTwice(entries, today)).toBe(true);
  });

  it("alerts when today and yesterday are both misses", () => {
    const entries = [
      entry("2026-11-10", false),
      entry("2026-11-11", false),
    ];
    expect(neverMissTwice(entries, today)).toBe(true);
  });

  it("alerts when yesterday and the day before are both misses and today is open", () => {
    const entries = [
      entry("2026-11-09", false),
      entry("2026-11-10", false),
    ];
    expect(neverMissTwice(entries, today)).toBe(true);
  });

  it("does not alert when yesterday was a hit", () => {
    const entries = [entry("2026-11-10", true)];
    expect(neverMissTwice(entries, today)).toBe(false);
  });

  it("does not alert when today recovers after yesterday miss", () => {
    const entries = [
      entry("2026-11-10", false),
      entry("2026-11-11", true),
    ];
    expect(neverMissTwice(entries, today)).toBe(false);
  });
});

describe("weeklyScorePercent and fiveAmRate", () => {
  it("computes weekly score percent over logged days", () => {
    const entries = [
      entry("2026-11-09", true, ["DONE", "DONE", "DONE", "DONE"]), // 5/5
      entry("2026-11-10", true, ["DONE", "MINIMUM", "MISSED", "DONE"]), // 4/5
    ];
    // (5+4) / (5*2) = 0.9
    expect(weeklyScorePercent(entries, 4)).toBeCloseTo(0.9);
  });

  it("returns 0 for empty week", () => {
    expect(weeklyScorePercent([], 4)).toBe(0);
    expect(fiveAmRate([])).toBe(0);
  });

  it("computes 5 AM rate", () => {
    const entries = [
      entry("2026-11-08", true),
      entry("2026-11-09", false),
      entry("2026-11-10", true),
    ];
    expect(fiveAmRate(entries)).toBeCloseTo(2 / 3);
  });
});

describe("timezone calendar dates", () => {
  it("shifts calendar dates without timezone drift", () => {
    expect(shiftCalendarDate("2026-11-10", -1)).toBe("2026-11-09");
    expect(shiftCalendarDate("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("resolves Africa/Nairobi vs UTC around midnight", () => {
    // 2026-11-10 21:30 UTC = 2026-11-11 00:30 in Africa/Nairobi (UTC+3)
    const instant = new Date("2026-11-10T21:30:00.000Z");
    expect(calendarDateInZone(instant, "UTC")).toBe("2026-11-10");
    expect(calendarDateInZone(instant, "Africa/Nairobi")).toBe("2026-11-11");

    expect(
      zonedCalendarDate("2026-11-10T21:30:00.000Z", "Africa/Nairobi"),
    ).toBe("2026-11-11");
  });
});
