import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WeekClient } from "@/components/week/WeekClient";
import { getWeekPageData } from "@/lib/entries";
import { prisma } from "@/lib/db";
import { ensureUserDefaults } from "@/lib/user-bootstrap";

export default async function WeekPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  await ensureUserDefaults(session.user.id);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const data = await getWeekPageData(user.id, user.timezone);

  // Sessions toward burning goal: count days with Action win DONE/MINIMUM this week
  const actionWin = data.winTypes.find((win) =>
    win.name.toLowerCase().includes("burning"),
  );
  let sessionsDone = 0;
  if (actionWin) {
    for (const day of data.dayRows) {
      const check = day.entry?.winChecks.find(
        (item) => item.winTypeId === actionWin.id,
      );
      if (check && (check.status === "DONE" || check.status === "MINIMUM")) {
        sessionsDone += 1;
      }
    }
  }

  const sessionsTarget = Number.parseInt(
    (data.review?.targetText ?? "").match(/\d+/)?.[0] ?? "3",
    10,
  );

  return (
    <WeekClient
      weekStart={data.weekStart}
      weekScorePercent={data.weekScore}
      burningGoal={data.review?.burningGoal ?? ""}
      why={data.review?.why ?? ""}
      targetText={data.review?.targetText ?? "3 sessions"}
      sessionsDone={sessionsDone}
      sessionsTarget={Number.isFinite(sessionsTarget) ? sessionsTarget : 3}
      fiveAmDays={data.fiveAmDays}
      fiveAmTarget={data.fiveAmTarget}
      days={data.dayRows.map((day) => ({
        date: day.date,
        wakeTime: day.entry?.wakeTime ?? null,
        score: day.score,
        max: day.max,
        isToday: day.isToday,
        isFuture: day.isFuture,
      }))}
      reviewEditable={data.reviewEditable}
      worked={data.review?.worked ?? ""}
      obstacles={data.review?.obstacles ?? ""}
      adjustment={data.review?.adjustment ?? ""}
    />
  );
}
