import { db } from "@/lib/db";

export async function getPendingRewardRedemptionRequests(familyId: string) {
  return db.rewardRedemptionRequest.findMany({
    where: { familyId, status: "PENDING" },
    include: {
      cub: { select: { id: true, displayName: true } },
      rewardStoreItem: {
        select: {
          id: true,
          title: true,
          description: true,
          costFocusTokens: true,
          grantType: true,
          minutesGranted: true,
        },
      },
    },
    orderBy: { requestedAt: "asc" },
  });
}

export async function countPendingRewardRedemptionRequests(familyId: string) {
  return db.rewardRedemptionRequest.count({
    where: { familyId, status: "PENDING" },
  });
}

export async function getCubPendingRewardRedemptionRequests(
  cubId: string,
  familyId: string,
) {
  return db.rewardRedemptionRequest.findMany({
    where: { cubId, familyId, status: "PENDING" },
    include: {
      rewardStoreItem: {
        select: {
          id: true,
          title: true,
          costFocusTokens: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getCubDeclinedRewardRedemptionNotes(
  cubId: string,
  familyId: string,
) {
  const declined = await db.rewardRedemptionRequest.findMany({
    where: {
      cubId,
      familyId,
      status: "REJECTED",
      reviewNote: { not: null },
    },
    orderBy: { reviewedAt: "desc" },
    take: 20,
    select: {
      rewardStoreItemId: true,
      reviewNote: true,
    },
  });

  const notesByItemId = new Map<string, string>();
  for (const entry of declined) {
    if (entry.reviewNote && !notesByItemId.has(entry.rewardStoreItemId)) {
      notesByItemId.set(entry.rewardStoreItemId, entry.reviewNote);
    }
  }

  return notesByItemId;
}
