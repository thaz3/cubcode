import type { Challenge, ChallengeProgressStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getCurrentInterval } from "@/lib/challenge-intervals";
import type { CubRoutinePreview } from "@/components/cub-routines-section";

export type CubUpcomingRoutine = {
  id: string;
  title: string;
  intervalType: Challenge["intervalType"];
  intervalConfig: Challenge["intervalConfig"];
};

export type CubRoutinesView = {
  dueToday: CubRoutinePreview[];
  upcoming: CubUpcomingRoutine[];
};

export async function getCubRoutinesView(
  familyId: string,
  cubId: string,
): Promise<CubRoutinesView> {
  const challenges = await db.challenge.findMany({
    where: { familyId, cubId, status: "ACTIVE" },
    orderBy: { title: "asc" },
  });

  const dueToday: CubRoutinePreview[] = [];
  const upcoming: CubUpcomingRoutine[] = [];

  for (const challenge of challenges) {
    const interval = getCurrentInterval(challenge);
    if (!interval) {
      upcoming.push({
        id: challenge.id,
        title: challenge.title,
        intervalType: challenge.intervalType,
        intervalConfig: challenge.intervalConfig,
      });
      continue;
    }

    const log = await db.challengeProgressLog.findUnique({
      where: {
        challengeId_intervalStart: {
          challengeId: challenge.id,
          intervalStart: interval.start,
        },
      },
      select: { status: true },
    });

    dueToday.push({
      id: challenge.id,
      title: challenge.title,
      intervalType: challenge.intervalType,
      intervalConfig: challenge.intervalConfig,
      logStatus: (log?.status as ChallengeProgressStatus | undefined) ?? null,
      intervalLabel: interval.label,
    });
  }

  return { dueToday, upcoming };
}

export async function getCubRoutinesDueToday(
  familyId: string,
  cubId: string,
): Promise<CubRoutinePreview[]> {
  const { dueToday } = await getCubRoutinesView(familyId, cubId);
  return dueToday;
}

export async function countSubmittedChallengeLogs(familyId: string): Promise<number> {
  return db.challengeProgressLog.count({
    where: { familyId, status: "SUBMITTED" },
  });
}
