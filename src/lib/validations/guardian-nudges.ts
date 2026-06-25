import { z } from "zod";
import type { GuardianNudgeRuleType } from "@/generated/prisma/client";

const hmSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use HH:mm format")
  .optional()
  .or(z.literal(""));

export const guardianNudgePreferencesSchema = z.object({
  quietHoursStart: hmSchema,
  quietHoursEnd: hmSchema,
  timezone: z.string().min(1).max(64),
  dailySummaryEnabled: z.coerce.boolean(),
  dailySummaryTime: hmSchema,
});

export const guardianNudgeRuleSchema = z.object({
  type: z.enum([
    "NOT_TOUCHED_AFTER_ASSIGN",
    "NOT_STARTED_BEFORE_DUE",
    "OVERDUE_NOT_STARTED",
    "SUBMITTED_FOR_REVIEW",
    "DAILY_SUMMARY",
  ] satisfies GuardianNudgeRuleType[]),
  enabled: z.coerce.boolean(),
  offsetMinutes: z.coerce.number().int().min(15).max(24 * 60).optional(),
});

export const nudgeIdSchema = z.object({
  nudgeId: z.string().min(1),
});
