import type { Prisma, Task } from "@/generated/prisma/client";
import { db } from "@/lib/db";

type DbClient = typeof db | Prisma.TransactionClient;

export function calculateFocusSessionMinutes(
  sessionStartedAt: Date,
  endedAt = new Date(),
): number {
  const elapsedMs = Math.max(0, endedAt.getTime() - sessionStartedAt.getTime());
  return Math.max(1, Math.round(elapsedMs / 60000));
}

export async function logTaskFocusSession(
  task: Pick<Task, "id" | "cubId" | "title" | "growthCategory" | "focusSessionStartedAt">,
  options?: {
    endedAt?: Date;
    note?: string;
    attemptLabel?: string;
    client?: DbClient;
  },
) {
  if (!task.cubId || !task.focusSessionStartedAt) {
    return null;
  }

  const client = options?.client ?? db;
  const endedAt = options?.endedAt ?? new Date();
  const durationMinutes = calculateFocusSessionMinutes(
    task.focusSessionStartedAt,
    endedAt,
  );
  const attemptNote = options?.attemptLabel ?? "Instructions viewed";
  const note = options?.note ?? `${attemptNote}: ${task.title}`;

  return client.focusBlockLog.create({
    data: {
      cubId: task.cubId,
      taskId: task.id,
      durationMinutes,
      startedAt: task.focusSessionStartedAt,
      note,
      growthCategory: task.growthCategory,
    },
  });
}

export async function getTaskFocusMinutesTotal(taskId: string): Promise<number> {
  const result = await db.focusBlockLog.aggregate({
    where: { taskId },
    _sum: { durationMinutes: true },
  });

  return result._sum.durationMinutes ?? 0;
}

export function formatFocusSessionStatus(
  focusSessionStartedAt: Date | null,
  status: Task["status"],
): string | null {
  if (status !== "IN_PROGRESS" || !focusSessionStartedAt) {
    return null;
  }

  const minutes = calculateFocusSessionMinutes(focusSessionStartedAt);
  return `Request timer running · ${minutes} min since instructions opened`;
}
