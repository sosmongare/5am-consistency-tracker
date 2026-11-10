import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ensureUserDefaults } from "@/lib/user-bootstrap";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

export async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new AuthRequiredError();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      winTypes: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!user) {
    throw new AuthRequiredError();
  }

  if (!user.settings || user.winTypes.length === 0) {
    await ensureUserDefaults(user.id);
    return prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        settings: true,
        winTypes: { orderBy: { sortOrder: "asc" } },
      },
    });
  }

  return user;
}
