"use client";

import { useState, useTransition } from "react";
import { upsertWeeklyReview } from "@/app/actions/weekly";
import { WeekDayRow } from "@/components/ui/WeekDayRow";
import {
  formatShortDay,
  formatWakeDisplay,
  formatWeekRange,
  weekNumberLabel,
} from "@/lib/dates";

type DayRow = {
  date: string;
  wakeTime: string | null;
  score: number | null;
  max: number;
  isToday: boolean;
  isFuture: boolean;
};

type WeekClientProps = {
  weekStart: string;
  weekScorePercent: number;
  burningGoal: string;
  why: string;
  targetText: string;
  sessionsDone: number;
  sessionsTarget: number;
  fiveAmDays: number;
  fiveAmTarget: number;
  days: DayRow[];
  reviewEditable: boolean;
  worked: string;
  obstacles: string;
  adjustment: string;
};

export function WeekClient({
  weekStart,
  weekScorePercent,
  burningGoal: initialGoal,
  why: initialWhy,
  targetText: initialTarget,
  sessionsDone,
  sessionsTarget,
  fiveAmDays,
  fiveAmTarget,
  days,
  reviewEditable,
  worked: initialWorked,
  obstacles: initialObstacles,
  adjustment: initialAdjustment,
}: WeekClientProps) {
  const [burningGoal, setBurningGoal] = useState(initialGoal);
  const [why, setWhy] = useState(initialWhy);
  const [targetText, setTargetText] = useState(initialTarget);
  const [worked, setWorked] = useState(initialWorked);
  const [obstacles, setObstacles] = useState(initialObstacles);
  const [adjustment, setAdjustment] = useState(initialAdjustment);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const progress =
    sessionsTarget > 0
      ? Math.min(100, Math.round((sessionsDone / sessionsTarget) * 100))
      : 0;

  function save() {
    startTransition(async () => {
      const result = await upsertWeeklyReview({
        weekStart,
        burningGoal: burningGoal || null,
        why: why || null,
        targetText: targetText || null,
        worked: worked || null,
        obstacles: obstacles || null,
        adjustment: adjustment || null,
      });
      setMessage(result.ok ? "Week saved." : result.error);
    });
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{weekNumberLabel(weekStart)}</p>
          <h1 className="text-3xl font-bold text-foreground">
            {formatWeekRange(weekStart)}
          </h1>
        </div>
        <span className="rounded-pill bg-done px-3 py-1.5 text-sm font-semibold text-accent-foreground">
          Score {Math.round(weekScorePercent * 100)}%
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="rounded-card border border-border bg-surface p-5 lg:col-start-1 lg:row-start-1">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Burning goal this week
          </p>
          <input
            value={burningGoal}
            onChange={(event) => setBurningGoal(event.target.value)}
            className="mt-3 min-h-12 w-full rounded-input border border-border bg-background px-3 text-base font-bold text-foreground"
            placeholder="e.g. Run 3 times"
            aria-label="Burning goal"
          />
          <label className="mt-3 block text-sm text-muted" htmlFor="why">
            Why it matters
          </label>
          <input
            id="why"
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            className="mt-1 min-h-12 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground"
            placeholder="energy for the whole day"
          />
          <div
            className="mt-4 h-3 overflow-hidden rounded-pill bg-background"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Burning goal progress"
          >
            <div
              className="h-full rounded-pill bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            {sessionsDone} of {sessionsTarget || "?"} sessions · 5 AM days:{" "}
            {fiveAmDays} of {fiveAmTarget} target
          </p>
          <input
            value={targetText}
            onChange={(event) => setTargetText(event.target.value)}
            className="mt-3 min-h-12 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground"
            placeholder="Target note (optional)"
            aria-label="Weekly target note"
          />
        </section>

        <section className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
              Daily wins
            </h2>
            <p className="text-sm text-muted">5 AM + 4 wins</p>
          </div>
          <div className="space-y-2">
            {days.map((day) => (
              <WeekDayRow
                key={day.date}
                label={formatShortDay(day.date)}
                wakeTime={
                  day.isFuture
                    ? "–"
                    : day.wakeTime
                      ? formatWakeDisplay(day.wakeTime).replace(/ [AP]M/, "")
                      : "–"
                }
                score={day.isFuture ? null : day.score}
                max={day.max}
                isToday={day.isToday}
                isFuture={day.isFuture}
              />
            ))}
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-5 lg:col-start-1 lg:row-start-2">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Weekly review
            {reviewEditable ? "" : " · Opens Sunday"}
          </p>
          <div className="mt-3 divide-y divide-border">
            <label className="block py-3">
              <span className="text-sm font-semibold text-foreground">
                What worked this week?
              </span>
              <textarea
                value={worked}
                onChange={(event) => setWorked(event.target.value)}
                disabled={!reviewEditable}
                rows={2}
                className="mt-2 w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              />
            </label>
            <label className="block py-3">
              <span className="text-sm font-semibold text-foreground">
                What got in the way?
              </span>
              <textarea
                value={obstacles}
                onChange={(event) => setObstacles(event.target.value)}
                disabled={!reviewEditable}
                rows={2}
                className="mt-2 w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              />
            </label>
            <label className="block py-3">
              <span className="text-sm font-semibold text-foreground">
                One adjustment for next week
              </span>
              <textarea
                value={adjustment}
                onChange={(event) => setAdjustment(event.target.value)}
                disabled={!reviewEditable}
                rows={2}
                className="mt-2 w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              />
            </label>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center rounded-input bg-accent px-4 text-sm font-bold text-accent-foreground disabled:opacity-60 lg:max-w-md"
      >
        {pending ? "Saving…" : "Save week"}
      </button>
      {message ? (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      ) : null}
    </div>
  );
}
