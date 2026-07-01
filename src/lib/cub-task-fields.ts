import type { Cub } from "@/generated/prisma/client";
import { taskRewardFieldsSchema } from "@/lib/validations/task";
import type { z } from "zod";

export type TaskRewardValues = z.infer<typeof taskRewardFieldsSchema>;

export function cubRewardFields(cub: Cub): TaskRewardValues {
  return {
    focusMinutesEarned: cub.focusMinutesEarned,
    phoneMinutesEarned: cub.phoneMinutesEarned,
    xpEarned: cub.xpEarned,
    focusTokensEarned: cub.focusTokensEarned,
  };
}

export function parseTaskRewardFieldsFromForm(
  formData: FormData,
  fallback?: TaskRewardValues,
): TaskRewardValues | { error: string } {
  const hasRewardFields =
    formData.has("focusMinutesEarned") ||
    formData.has("phoneMinutesEarned") ||
    formData.has("xpEarned") ||
    formData.has("focusTokensEarned");

  if (!hasRewardFields && fallback) {
    return fallback;
  }

  const parsed = taskRewardFieldsSchema.safeParse({
    focusMinutesEarned: formData.get("focusMinutesEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid reward amounts",
    };
  }

  return parsed.data;
}

/** @deprecated Use cubRewardFields */
export const cubProofAndRewardFields = cubRewardFields;
