"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { dateOnlyToUtc, todayInZone } from "@/lib/dates";
import { canEditFromToday } from "@/lib/edit-window";
import { isUpByTarget } from "@/lib/scoring";
import { AuthRequiredError, requireUser } from "@/lib/session";
import {
  upsertDailyEntrySchema,
  type UpsertDailyEntryInput,
} from "@/lib/validators";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function upsertDailyEntry(
  raw: UpsertDailyEntryInput,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = upsertDailyEntrySchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const input = parsed.data;
    const settings = user.settings!;
    const today = todayInZone(user.timezone);

    if (!canEditFromToday(input.date, today)) {
      return {
        ok: false,
        error: "This day is read-only. Edit older days from History.",
      };
    }

    const winTypeIds = new Set(user.winTypes.map((win) => win.id));
    for (const win of input.wins) {
      if (!winTypeIds.has(win.winTypeId)) {
        return { ok: false, error: "Unknown win type" };
      }
    }

    const wakeTime = input.wakeTime ?? null;
    const upByTarget = isUpByTarget(wakeTime, settings.targetWakeTime);
    const date = dateOnlyToUtc(input.date);

    await prisma.$transaction(async (tx) => {
      const entry = await tx.dailyEntry.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
        create: {
          userId: user.id,
          date,
          wakeTime,
          bedtime: input.bedtime ?? null,
          upByTarget,
          gratitude1: input.gratitude1 ?? null,
          gratitude2: input.gratitude2 ?? null,
          gratitude3: input.gratitude3 ?? null,
          reflection: input.reflection ?? null,
          notes: input.notes ?? null,
        },
        update: {
          wakeTime,
          bedtime: input.bedtime ?? null,
          upByTarget,
          gratitude1: input.gratitude1 ?? null,
          gratitude2: input.gratitude2 ?? null,
          gratitude3: input.gratitude3 ?? null,
          reflection: input.reflection ?? null,
          notes: input.notes ?? null,
        },
      });

      for (const win of input.wins) {
        await tx.winCheck.upsert({
          where: {
            dailyEntryId_winTypeId: {
              dailyEntryId: entry.id,
              winTypeId: win.winTypeId,
            },
          },
          create: {
            dailyEntryId: entry.id,
            winTypeId: win.winTypeId,
            status: win.status,
          },
          update: {
            status: win.status,
          },
        });
      }
    });

    revalidatePath("/today");
    revalidatePath("/week");
    revalidatePath("/stats");
    revalidatePath("/history");
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return { ok: false, error: "Please sign in again." };
    }
    console.error(error);
    return { ok: false, error: "Could not save today’s entry." };
  }
}
