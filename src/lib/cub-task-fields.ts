import type { Cub } from "@/generated/prisma/client";

export function cubRewardFields(cub: Cub) {
  return {
    focusMinutesEarned: cub.focusMinutesEarned,
    phoneMinutesEarned: cub.phoneMinutesEarned,
    xpEarned: cub.xpEarned,
    focusTokensEarned: cub.focusTokensEarned,
  };
}

/** @deprecated Use cubRewardFields */
export const cubProofAndRewardFields = cubRewardFields;
