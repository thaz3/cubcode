import type { TaskStatus } from "@/generated/prisma/client";
import {
  formatGroupedEarnedRewards,
  groupCubLedgerEntries,
  type CubLedgerEntry,
} from "@/lib/cub-ledger";
import { formatTaskRewards } from "@/lib/task-labels";

export type CompletionFeedItem = {
  id: string;
  title: string;
  subtitle: string;
  rewardsLine: string | null;
  status?: TaskStatus;
  occurredAt: Date;
};

type CompletedTaskInput = {
  id: string;
  title: string;
  status: TaskStatus;
  reviewedAt: Date | null;
  updatedAt: Date;
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  focusMinutesEarned: number;
};

function ledgerTaskId(groupId: string): string | null {
  if (!groupId.startsWith("task:")) {
    return null;
  }
  return groupId.slice("task:".length) || null;
}

export function buildCompletionFeedItems(
  ledgerEntries: CubLedgerEntry[],
  completedTasks: CompletedTaskInput[],
  limit = 12,
): CompletionFeedItem[] {
  const grouped = groupCubLedgerEntries(ledgerEntries);
  const coveredTaskIds = new Set<string>();

  const fromLedger: CompletionFeedItem[] = grouped.map((group) => {
    const taskId = ledgerTaskId(group.id);
    if (taskId) {
      coveredTaskIds.add(taskId);
    }

    const rewardsLine = formatGroupedEarnedRewards(group.rewards);

    return {
      id: group.id,
      title: group.title,
      subtitle: group.label,
      rewardsLine: rewardsLine || null,
      occurredAt: group.createdAt,
    };
  });

  const fromTasks: CompletionFeedItem[] = completedTasks
    .filter((task) => !coveredTaskIds.has(task.id))
    .map((task) => {
      const occurredAt = task.reviewedAt ?? task.updatedAt;

      return {
        id: `completed:${task.id}`,
        title: task.title,
        subtitle:
          task.status === "REJECTED"
            ? "Not approved"
            : "Task completed",
        rewardsLine:
          task.status === "REJECTED"
            ? null
            : formatTaskRewards(task, { referenceTime: occurredAt }),
        status: task.status,
        occurredAt,
      };
    });

  return [...fromLedger, ...fromTasks]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, limit);
}

export type SerializedCompletionFeedItem = Omit<
  CompletionFeedItem,
  "occurredAt"
> & {
  occurredAt: string;
};

export function serializeCompletionFeedItems(
  items: CompletionFeedItem[],
): SerializedCompletionFeedItem[] {
  return items.map((item) => ({
    ...item,
    occurredAt: item.occurredAt.toISOString(),
  }));
}
