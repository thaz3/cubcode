import type { RewardGrantType } from "@/generated/prisma/client";

export function formatRewardGrantLabel(item: {
  grantType: RewardGrantType;
  minutesGranted: number | null;
}): string | null {
  if (!item.minutesGranted || item.grantType === "NONE") {
    return null;
  }

  if (item.grantType === "PHONE_TIME") {
    return `+${item.minutesGranted} min phone time (applied today)`;
  }

  if (item.grantType === "WEEKEND_BANK") {
    return `+${item.minutesGranted} min Weekend Bank`;
  }

  return null;
}
