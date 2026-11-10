import { z } from "zod";

export const winStatusSchema = z.enum(["DONE", "MINIMUM", "MISSED"]);

export const timeHmmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm");

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const upsertDailyEntrySchema = z.object({
  date: dateOnlySchema,
  wakeTime: timeHmmSchema.nullable().optional(),
  bedtime: timeHmmSchema.nullable().optional(),
  gratitude1: z.string().max(200).nullable().optional(),
  gratitude2: z.string().max(200).nullable().optional(),
  gratitude3: z.string().max(200).nullable().optional(),
  reflection: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  wins: z
    .array(
      z.object({
        winTypeId: z.string().min(1),
        status: winStatusSchema,
      }),
    )
    .default([]),
});

export type UpsertDailyEntryInput = z.infer<typeof upsertDailyEntrySchema>;

export const upsertWeeklyReviewSchema = z.object({
  weekStart: dateOnlySchema,
  burningGoal: z.string().max(200).nullable().optional(),
  why: z.string().max(500).nullable().optional(),
  targetText: z.string().max(200).nullable().optional(),
  targetHit: z.boolean().nullable().optional(),
  worked: z.string().max(1000).nullable().optional(),
  obstacles: z.string().max(1000).nullable().optional(),
  adjustment: z.string().max(1000).nullable().optional(),
});

export type UpsertWeeklyReviewInput = z.infer<typeof upsertWeeklyReviewSchema>;
