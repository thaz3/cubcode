import type { RewardGrantType } from "@/generated/prisma/client";

export function getRewardStoreEmoji(item: {
  title: string;
  grantType: RewardGrantType;
}): string {
  const title = item.title.toLowerCase();

  if (item.grantType === "PHONE_TIME" || title.includes("phone")) {
    return "📱";
  }
  if (item.grantType === "WEEKEND_BANK") {
    return "🏦";
  }
  if (item.grantType === "FOCUS_AREA_SWAP" || title.includes("focus area")) {
    return "🔄";
  }
  if (title.includes("dinner") || title.includes("meal") || title.includes("food")) {
    return "🍽️";
  }
  if (title.includes("stay up") || title.includes("later") || title.includes("bedtime")) {
    return "🌙";
  }
  if (title.includes("game") || title.includes("play")) {
    return "🎮";
  }
  if (title.includes("movie") || title.includes("show")) {
    return "🎬";
  }

  return "🎁";
}

export function getRewardStoreAccent(item: {
  grantType: RewardGrantType;
}): "gold" | "green" | "violet" | "sky" {
  switch (item.grantType) {
    case "PHONE_TIME":
      return "green";
    case "WEEKEND_BANK":
      return "sky";
    case "FOCUS_AREA_SWAP":
      return "violet";
    default:
      return "gold";
  }
}
