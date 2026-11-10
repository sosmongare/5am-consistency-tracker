import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TodayClient } from "@/components/today/TodayClient";
import { getTodayPageData } from "@/lib/entries";
import { prisma } from "@/lib/db";
import { ensureUserDefaults } from "@/lib/user-bootstrap";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  await ensureUserDefaults(session.user.id);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const data = await getTodayPageData(user.id, user.timezone);
  const winStatusMap: Record<string, "DONE" | "MINIMUM" | "MISSED" | "OPEN"> =
    {};
  for (const win of data.winTypes) {
    const check = data.todayEntry?.winChecks.find(
      (item) => item.winTypeId === win.id,
    );
    winStatusMap[win.id] = check?.status ?? "OPEN";
  }

  return (
    <TodayClient
      today={data.today}
      timezone={user.timezone}
      targetWakeTime={data.settings.targetWakeTime}
      streakCurrent={data.streak.current}
      showNeverMissTwice={data.showNeverMissTwice}
      winTypes={data.winTypes.map((win) => ({
        id: win.id,
        name: win.name,
        minimumVersion: win.minimumVersion,
        sortOrder: win.sortOrder,
      }))}
      initial={{
        wakeTime: data.todayEntry?.wakeTime ?? null,
        bedtime: data.todayEntry?.bedtime ?? null,
        gratitude1: data.todayEntry?.gratitude1 ?? "",
        gratitude2: data.todayEntry?.gratitude2 ?? "",
        gratitude3: data.todayEntry?.gratitude3 ?? "",
        reflection: data.todayEntry?.reflection ?? "",
        wins: winStatusMap,
      }}
    />
  );
}
