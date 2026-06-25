import type { Challenge } from "@/generated/prisma/client";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatProofType } from "@/lib/task-labels";

export function formatChallengeRewards(
  challenge: Pick<
    Challenge,
    "xpEarned" | "focusTokensEarned" | "phoneMinutesEarned"
  >,
): string {
  const parts: string[] = [];
  if (challenge.xpEarned > 0) parts.push(`${challenge.xpEarned} XP`);
  if (challenge.focusTokensEarned > 0) {
    parts.push(
      `${challenge.focusTokensEarned} Focus Token${challenge.focusTokensEarned === 1 ? "" : "s"}`,
    );
  }
  if (challenge.phoneMinutesEarned > 0) {
    parts.push(`${challenge.phoneMinutesEarned} min phone time`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No rewards configured";
}

export function formatChallengeSummary(
  challenge: Pick<Challenge, "intervalType" | "intervalConfig" | "proofType">,
): string {
  return `${formatChallengeInterval(challenge.intervalType, challenge.intervalConfig)} · Proof: ${formatProofType(challenge.proofType)}`;
}
