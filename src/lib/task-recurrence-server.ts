import type { Task } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { advanceDueDate } from "@/lib/task-recurrence";
import {
  parseRecurrenceConfigValue,
  recurrenceConfigHasTime,
} from "@/lib/task-recurrence-config";

type DbClient = typeof db | Prisma.TransactionClient;

export async function spawnNextRecurringTask(
  completedTask: Task,
  client: DbClient = db,
): Promise<void> {
  if (completedTask.recurrence === "NONE" || !completedTask.cubId) {
    return;
  }

  const config = parseRecurrenceConfigValue(completedTask.recurrenceConfig);
  const anchor = completedTask.dueAt ?? completedTask.reviewedAt ?? new Date();
  const nextDue = advanceDueDate(anchor, completedTask.recurrence, config);
  const dueAtHasTime =
    completedTask.dueAtHasTime || recurrenceConfigHasTime(config);

  await client.task.create({
    data: {
      familyId: completedTask.familyId,
      cubId: completedTask.cubId,
      templateId: completedTask.templateId,
      title: completedTask.title,
      description: completedTask.description,
      category: completedTask.category,
      subcategory: completedTask.subcategory,
      growthCategory: completedTask.growthCategory,
      proofType: completedTask.proofType,
      proofPrompt: completedTask.proofPrompt,
      proofChecklistItems: completedTask.proofChecklistItems ?? undefined,
      focusMinutesEarned: completedTask.focusMinutesEarned,
      phoneMinutesEarned: completedTask.phoneMinutesEarned,
      xpEarned: completedTask.xpEarned,
      focusTokensEarned: completedTask.focusTokensEarned,
      recurrence: completedTask.recurrence,
      recurrenceConfig: completedTask.recurrenceConfig ?? undefined,
      status: "CLAIMED",
      claimedAt: new Date(),
      dueAt: nextDue,
      dueAtHasTime,
    },
  });
}
