"use client";

import { useMemo, useState, useTransition } from "react";
import { upsertDailyEntry } from "@/app/actions/daily";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { ScorePips } from "@/components/ui/ScorePips";
import { WinRow, type WinRowStatus } from "@/components/ui/WinRow";
import { formatDisplayDate, formatWakeDisplay, nowTimeInZone } from "@/lib/dates";
import { dailyScore, isUpByTarget } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type WinTypeDto = {
  id: string;
  name: string;
  minimumVersion: string;
  sortOrder: number;
};

type WinStatusDto = "DONE" | "MINIMUM" | "MISSED";

type TodayClientProps = {
  today: string;
  timezone: string;
  targetWakeTime: string;
  streakCurrent: number;
  showNeverMissTwice: boolean;
  winTypes: WinTypeDto[];
  initial: {
    wakeTime: string | null;
    bedtime: string | null;
    gratitude1: string;
    gratitude2: string;
    gratitude3: string;
    reflection: string;
    wins: Record<string, WinStatusDto | "OPEN">;
  };
};

const cycle: Array<WinStatusDto | "OPEN"> = [
  "OPEN",
  "DONE",
  "MINIMUM",
  "MISSED",
];

function nextStatus(current: WinStatusDto | "OPEN"): WinStatusDto | "OPEN" {
  const index = cycle.indexOf(current);
  return cycle[(index + 1) % cycle.length];
}

export function TodayClient({
  today,
  timezone,
  targetWakeTime,
  streakCurrent,
  showNeverMissTwice,
  winTypes,
  initial,
}: TodayClientProps) {
  const [wakeTime, setWakeTime] = useState<string | null>(initial.wakeTime);
  const [bedtime] = useState<string | null>(initial.bedtime);
  const [wins, setWins] = useState(initial.wins);
  const [gratitude1, setGratitude1] = useState(initial.gratitude1);
  const [gratitude2, setGratitude2] = useState(initial.gratitude2);
  const [gratitude3, setGratitude3] = useState(initial.gratitude3);
  const [reflection, setReflection] = useState(initial.reflection);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const upByTarget = isUpByTarget(wakeTime, targetWakeTime);
  const winChecks = useMemo(
    () =>
      winTypes
        .map((win) => {
          const status = wins[win.id];
          if (!status || status === "OPEN") {
            return null;
          }
          return { status };
        })
        .filter((value): value is { status: WinStatusDto } => value !== null),
    [wins, winTypes],
  );

  const { score, max } = dailyScore({ upByTarget, winChecks }, winTypes.length);

  function setToNow() {
    setWakeTime(nowTimeInZone(timezone));
    setMessage(null);
  }

  function cycleWin(winTypeId: string) {
    setWins((prev) => ({
      ...prev,
      [winTypeId]: nextStatus(prev[winTypeId] ?? "OPEN"),
    }));
  }

  function save() {
    startTransition(async () => {
      const result = await upsertDailyEntry({
        date: today,
        wakeTime,
        bedtime,
        gratitude1: gratitude1 || null,
        gratitude2: gratitude2 || null,
        gratitude3: gratitude3 || null,
        reflection: reflection || null,
        wins: winTypes
          .map((win) => {
            const status = wins[win.id];
            if (!status || status === "OPEN") {
              return null;
            }
            return { winTypeId: win.id, status };
          })
          .filter(
            (value): value is { winTypeId: string; status: WinStatusDto } =>
              value !== null,
          ),
      });
      setMessage(result.ok ? "Saved." : result.error);
    });
  }

  const targetLabel = formatWakeDisplay(targetWakeTime);

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{formatDisplayDate(today)}</p>
          <h1 className="text-3xl font-bold text-foreground">Good morning</h1>
        </div>
        <span
          className={cn(
            "rounded-pill px-3 py-1.5 text-sm font-semibold",
            streakCurrent > 0
              ? "bg-accent text-accent-foreground"
              : "bg-surface text-muted",
          )}
        >
          {streakCurrent > 0
            ? `${streakCurrent}-day streak`
            : "Streak: 0"}
        </span>
      </header>

      {showNeverMissTwice ? (
        <AlertBanner title="Never miss twice.">
          You missed yesterday. Get up by {targetLabel} today and the habit
          stays alive. A minimum version counts.
        </AlertBanner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5">
          <section className="rounded-card border border-border bg-surface p-5">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Wake-up time
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <p className="text-5xl font-bold tracking-tight text-foreground">
                {wakeTime ? formatWakeDisplay(wakeTime) : "–:––"}
              </p>
              {!showNeverMissTwice || wakeTime ? (
                <button
                  type="button"
                  onClick={setToNow}
                  className="min-h-12 rounded-input border border-border px-4 text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
                >
                  Set to now
                </button>
              ) : null}
            </div>
            {wakeTime && upByTarget ? (
              <p className="mt-3 inline-flex items-center rounded-pill bg-done/15 px-3 py-1 text-sm font-semibold text-done">
                ✓ Up by {targetLabel}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              {wakeTime
                ? bedtime
                  ? `Bedtime last night: ${formatWakeDisplay(bedtime)}`
                  : "Wake time logged"
                : `Not logged yet • Target ${targetLabel}`}
            </p>
            {showNeverMissTwice && !wakeTime ? (
              <button
                type="button"
                onClick={setToNow}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-input bg-accent px-4 text-sm font-bold text-accent-foreground"
              >
                Set to now
              </button>
            ) : null}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
                Today&apos;s wins
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Score {score} / {max}
                </span>
                <ScorePips score={score} max={max} />
              </div>
            </div>
            <div className="space-y-2">
              {winTypes.map((win) => {
                const status = (wins[win.id] ?? "OPEN") as WinRowStatus;
                const detail =
                  status === "OPEN"
                    ? "Tap to log"
                    : status === "MINIMUM"
                      ? `Minimum: ${win.minimumVersion}`
                      : win.minimumVersion;
                return (
                  <WinRow
                    key={win.id}
                    name={win.name}
                    detail={detail}
                    status={status}
                    onCycle={() => cycleWin(win.id)}
                  />
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted">
              Tap to cycle: done → minimum → missed. Both done and minimum
              count.
            </p>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-card border border-border bg-surface p-5">
            <label className="text-xs font-semibold tracking-wide text-muted uppercase">
              3 things I&apos;m grateful for
            </label>
            <div className="mt-3 space-y-2">
              {[
                [gratitude1, setGratitude1, "gratitude1"],
                [gratitude2, setGratitude2, "gratitude2"],
                [gratitude3, setGratitude3, "gratitude3"],
              ].map(([value, setter, id]) => (
                <input
                  key={id as string}
                  id={id as string}
                  value={value as string}
                  onChange={(event) =>
                    (setter as (next: string) => void)(event.target.value)
                  }
                  className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-foreground placeholder:text-muted"
                  placeholder="…"
                />
              ))}
            </div>
            <label
              htmlFor="reflection"
              className="mt-5 block text-xs font-semibold tracking-wide text-muted uppercase"
            >
              One-line reflection
            </label>
            <input
              id="reflection"
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              className="mt-3 min-h-12 w-full rounded-input border border-border bg-background px-3 text-foreground placeholder:text-muted"
              placeholder="How did today feel?"
            />
          </section>

          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center rounded-input bg-accent px-4 text-base font-bold text-accent-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save today"}
          </button>
          {message ? (
            <p role="status" className="text-sm text-muted">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
