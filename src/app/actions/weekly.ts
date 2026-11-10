"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { dateOnlyToUtc, todayInZone, weekStartFor } from "@/lib/dates";
import { AuthRequiredError, requireUser } from "@/lib/session";
import {
  upsertWeeklyReviewSchema,
  type UpsertWeeklyReviewInput,
} from "@/lib/validators";

export type WeeklyActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function upsertWeeklyReview(
  raw: UpsertWeeklyReviewInput,
): Promise<WeeklyActionResult> {
  try {
    const user = await requireUser();
    const parsed = upsertWeeklyReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const input = parsed.data;
    const settings = user.settings!;
    const today = todayInZone(user.timezone);
    const currentWeekStart = weekStartFor(today, settings.weekStartDay);

    if (input.weekStart > today) {
      return { ok: false, error: "Cannot edit a future week." };
    }

    // Only the current (or past) week may be saved from the Week screen.
    if (input.weekStart !== currentWeekStart && input.weekStart > currentWeekStart) {
      return { ok: false, error: "That week is not editable here." };
    }

    await prisma.weeklyReview.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart: dateOnlyToUtc(input.weekStart),
        },
      },
      create: {
        userId: user.id,
        weekStart: dateOnlyToUtc(input.weekStart),
        burningGoal: input.burningGoal ?? null,
        why: input.why ?? null,
        targetText: input.targetText ?? null,
        targetHit: input.targetHit ?? null,
        worked: input.worked ?? null,
        obstacles: input.obstacles ?? null,
        adjustment: input.adjustment ?? null,
      },
      update: {
        burningGoal: input.burningGoal ?? null,
        why: input.why ?? null,
        targetText: input.targetText ?? null,
        targetHit: input.targetHit ?? null,
        worked: input.worked ?? null,
        obstacles: input.obstacles ?? null,
        adjustment: input.adjustment ?? null,
      },
    });

    revalidatePath("/week");
    revalidatePath("/history");
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return { ok: false, error: "Please sign in again." };
    }
    console.error(error);
    return { ok: false, error: "Could not save the weekly review." };
  }
}
