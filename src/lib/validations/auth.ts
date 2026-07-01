import { z } from "zod";
import { growthCategorySchema } from "@/lib/unified-growth-areas";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid or expired"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const accountSettingsSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = Boolean(
      data.currentPassword?.trim() ||
        data.newPassword?.trim() ||
        data.confirmPassword?.trim(),
    );

    if (!wantsPasswordChange) {
      return;
    }

    if (!data.currentPassword?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Enter your current password to change it",
        path: ["currentPassword"],
      });
    }

    if (!data.newPassword?.trim() || data.newPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be at least 8 characters",
        path: ["newPassword"],
      });
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New passwords do not match",
        path: ["confirmPassword"],
      });
    }
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
    .array(growthCategorySchema)
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
