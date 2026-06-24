import type { TaskStatus } from "@/generated/prisma/client";
import { TASK_STATUS_LABELS } from "@/lib/task-transitions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, string> = {
  AVAILABLE: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CLAIMED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  SUBMITTED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  SENT_BACK: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
