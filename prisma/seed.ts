import { PrismaClient } from "@prisma/client";
import { DEFAULT_WIN_TYPES } from "../src/lib/user-bootstrap";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@5am.local";

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Demo User",
      timezone: "Africa/Nairobi",
    },
    update: {
      name: "Demo User",
      timezone: "Africa/Nairobi",
    },
  });

  await prisma.settings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      targetWakeTime: "05:00",
      weekly5amTarget: 5,
      weekStartDay: 1,
    },
    update: {
      targetWakeTime: "05:00",
      weekly5amTarget: 5,
      weekStartDay: 1,
    },
  });

  const winCount = await prisma.winType.count({ where: { userId: user.id } });
  if (winCount === 0) {
    await prisma.winType.createMany({
      data: DEFAULT_WIN_TYPES.map((win) => ({
        userId: user.id,
        name: win.name,
        minimumVersion: win.minimumVersion,
        sortOrder: win.sortOrder,
      })),
    });
  }

  console.log(`Seeded demo user ${email} (${user.id})`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
