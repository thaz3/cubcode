import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const familySettingsSchema = z.object({
  name: z.string().trim().max(100).optional(),
  dailyPhoneCapMinutes: z.coerce
    .number()
    .int()
    .min(0, "Daily cap must be 0 or more")
    .max(480),
  weekendBankCapMinutes: z.coerce
    .number()
    .int()
    .min(0, "Weekend bank cap must be 0 or more")
    .max(1440),
  exchangeFocusMinutes: z.coerce
    .number()
    .int()
    .min(1, "Focus minutes must be at least 1")
    .max(240),
  exchangePhoneMinutes: z.coerce
    .number()
    .int()
    .min(0, "Phone minutes must be 0 or more")
    .max(240),
});

export const cubSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(100),
  ageBand: z.enum([
    "LITTLE_CUBS",
    "CORE_CUBS",
    "TRAIL_CUBS",
    "LEGACY_BUILDERS",
  ]),
  focusMinutesEarned: z.coerce
    .number()
    .int()
    .min(0, "Focus minutes earned must be 0 or more")
    .max(240),
  phoneMinutesEarned: z.coerce
    .number()
    .int()
    .min(0, "Phone time earned must be 0 or more")
    .max(480),
  xpEarned: z.coerce.number().int().min(0).max(10000),
  focusTokensEarned: z.coerce.number().int().min(0).max(100),
  dailyPhoneCapMinutes: z.coerce
    .number()
    .int()
    .min(0, "Daily cap must be 0 or more")
    .max(480),
  weekendBankCapMinutes: z.coerce
    .number()
    .int()
    .min(0, "Weekend bank cap must be 0 or more")
    .max(1440),
  supervisionLevel: z.enum(["DIRECT", "NEARBY", "INDEPENDENT"]),
  requiredGrowthCategories: z
    .array(z.enum(["CHARACTER", "WELLNESS", "CREATIVITY", "RESPONSIBILITY", "COMMUNITY"]))
    .min(1, "Pick at least one growth area"),
});

export const suggestedCapsSchema = z.object({
  ageBand: z.enum([
    "LITTLE_CUBS",
    "CORE_CUBS",
    "TRAIL_CUBS",
    "LEGACY_BUILDERS",
  ]),
});
