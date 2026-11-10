import { prisma } from "@/lib/db";

export const DEFAULT_WIN_TYPES = [
  {
    name: "Physical",
    minimumVersion: "5 minutes of stretching",
    sortOrder: 0,
  },
  {
    name: "Mental",
    minimumVersion: "read 1 page",
    sortOrder: 1,
  },
  {
    name: "Spiritual",
    minimumVersion: "1 minute of prayer",
    sortOrder: 2,
  },
  {
    name: "Action toward burning goal",
    minimumVersion: "one 10-minute step",
    sortOrder: 3,
  },
] as const;

export async function ensureUserDefaults(userId: string): Promise<void> {
  await prisma.settings.upsert({
    where: { userId },
    create: {
      userId,
      targetWakeTime: "05:00",
      weekly5amTarget: 5,
      weekStartDay: 1,
    },
    update: {},
  });

  const existing = await prisma.winType.count({ where: { userId } });
  if (existing === 0) {
    await prisma.winType.createMany({
      data: DEFAULT_WIN_TYPES.map((win) => ({
        userId,
        name: win.name,
        minimumVersion: win.minimumVersion,
        sortOrder: win.sortOrder,
      })),
    });
  }
}
