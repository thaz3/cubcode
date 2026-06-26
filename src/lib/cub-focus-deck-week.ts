import type { FocusActivityCompletionStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type CubFocusWeekCardStatus =
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "SENT_BACK"
  | "REWARDED";

export type CubFocusWeekCard = {
  stackItemId: string;
  cardId: string;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  status: CubFocusWeekCardStatus;
  statusLabel: string;
};

const STATUS_LABELS: Record<CubFocusWeekCardStatus, string> = {
  AVAILABLE: "Ready to pick",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Waiting for review",
  SENT_BACK: "Needs revision",
  REWARDED: "Approved",
};

function completionStatusToWeekStatus(
  status: FocusActivityCompletionStatus,
): CubFocusWeekCardStatus {
  switch (status) {
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "SUBMITTED":
      return "SUBMITTED";
    case "SENT_BACK":
      return "SENT_BACK";
    case "REWARDED":
      return "REWARDED";
    default:
      return "AVAILABLE";
  }
}

export async function getCubWeeklyFocusStack(
  familyId: string,
  cubId: string,
  weekStartsOn: Date,
): Promise<CubFocusWeekCard[]> {
  const [stackItems, completions] = await Promise.all([
    db.focusDeckStackItem.findMany({
      where: { familyId, cubId, weekStartsOn },
      include: {
        card: {
          select: {
            id: true,
            title: true,
            description: true,
            estimatedMinutes: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.focusActivityCompletion.findMany({
      where: { familyId, cubId, weekStartsOn },
      orderBy: { updatedAt: "desc" },
      select: { cardId: true, status: true },
    }),
  ]);

  const latestCompletionByCard = new Map<string, FocusActivityCompletionStatus>();
  for (const completion of completions) {
    if (!latestCompletionByCard.has(completion.cardId)) {
      latestCompletionByCard.set(completion.cardId, completion.status);
    }
  }

  return stackItems
    .filter((item) => item.card.status === "ACTIVE")
    .map((item) => {
      const completionStatus = latestCompletionByCard.get(item.cardId);
      const status: CubFocusWeekCardStatus = completionStatus
        ? completionStatusToWeekStatus(completionStatus)
        : "AVAILABLE";

      return {
        stackItemId: item.id,
        cardId: item.cardId,
        title: item.card.title,
        description: item.card.description,
        estimatedMinutes: item.card.estimatedMinutes,
        status,
        statusLabel: STATUS_LABELS[status],
      };
    });
}
