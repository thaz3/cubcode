import type { Challenge, ChallengeProgressLog, Cub, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { creditPhoneMinutesForCub } from "@/lib/rewards";
import { formatChallengeInterval } from "@/lib/challenge-intervals";

type LedgerClient = Prisma.TransactionClient | typeof db;

export async function challengeRewardsAlreadyCredited(
  logId: string,
  client: LedgerClient = db,
) {
  const existing = await client.xpLedgerEntry.findFirst({
    where: { sourceChallengeProgressLogId: logId },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function creditApprovedChallengeRewards(
  log: ChallengeProgressLog,
  challenge: Challenge,
  cub: Cub,
  createdByUserId: string,
  client: LedgerClient = db,
) {
  if (await challengeRewardsAlreadyCredited(log.id, client)) {
    return { alreadyCredited: true as const };
  }

  const intervalLabel = formatChallengeInterval(
    challenge.intervalType,
    challenge.intervalConfig,
  );
  const note = `Routine approved: ${challenge.title} (${intervalLabel})`;

  const baseEntry = {
    cubId: cub.id,
    sourceChallengeProgressLogId: log.id,
    createdByUserId,
    reason: "CHALLENGE_APPROVAL" as const,
  };

  if (challenge.xpEarned !== 0) {
    await client.xpLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: challenge.xpEarned,
        note,
      },
    });
  }

  if (challenge.focusTokensEarned !== 0) {
    await client.focusTokenLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: challenge.focusTokensEarned,
        note,
      },
    });
  }

  if (challenge.phoneMinutesEarned > 0) {
    await creditPhoneMinutesForCub(cub, challenge.phoneMinutesEarned, {
      reason: "CHALLENGE_APPROVAL",
      note,
      createdByUserId,
      sourceChallengeProgressLogId: log.id,
      client,
    });
  }

  return { alreadyCredited: false as const };
}
