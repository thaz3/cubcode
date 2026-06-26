import { db } from "@/lib/db";

export async function getPendingReviewItems(familyId: string) {
  const [tasks, challengeLogs, focusCompletions] = await Promise.all([
    db.task.findMany({
      where: { familyId, status: "SUBMITTED" },
      include: {
        cub: { select: { id: true, displayName: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    db.challengeProgressLog.findMany({
      where: { familyId, status: "SUBMITTED" },
      include: {
        cub: { select: { id: true, displayName: true } },
        challenge: { select: { title: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    db.focusActivityCompletion.findMany({
      where: { familyId, status: "SUBMITTED" },
      include: {
        cub: { select: { id: true, displayName: true } },
        card: { select: { title: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  return { tasks, challengeLogs, focusCompletions };
}

export async function countPendingTaskReviews(familyId: string) {
  return db.task.count({
    where: { familyId, status: "SUBMITTED" },
  });
}

export async function countPendingChallengeReviews(familyId: string) {
  return db.challengeProgressLog.count({
    where: { familyId, status: "SUBMITTED" },
  });
}

export async function countPendingFocusCardReviews(familyId: string) {
  return db.focusActivityCompletion.count({
    where: { familyId, status: "SUBMITTED" },
  });
}

export async function countPendingReviews(familyId: string) {
  const [tasks, challenges, focusCards] = await Promise.all([
    countPendingTaskReviews(familyId),
    countPendingChallengeReviews(familyId),
    countPendingFocusCardReviews(familyId),
  ]);

  return {
    tasks,
    challenges,
    focusCards,
    total: tasks + challenges + focusCards,
  };
}
