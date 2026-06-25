import type { Challenge, ChallengeProgressLog } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getCurrentInterval } from "@/lib/challenge-intervals";

export async function getOrCreateCurrentProgressLog(
  challenge: Challenge,
  now = new Date(),
): Promise<ChallengeProgressLog | null> {
  const interval = getCurrentInterval(challenge, now);
  if (!interval) {
    return null;
  }

  const existing = await db.challengeProgressLog.findUnique({
    where: {
      challengeId_intervalStart: {
        challengeId: challenge.id,
        intervalStart: interval.start,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return db.challengeProgressLog.create({
    data: {
      challengeId: challenge.id,
      familyId: challenge.familyId,
      cubId: challenge.cubId,
      intervalStart: interval.start,
      intervalEnd: interval.end,
      status: "PENDING",
    },
  });
}

export function challengeHasMeaningfulProgress(
  logs: Array<{ status: ChallengeProgressLog["status"] }>,
): boolean {
  return logs.some((log) =>
    ["SUBMITTED", "SENT_BACK", "REJECTED", "REWARDED"].includes(log.status),
  );
}
