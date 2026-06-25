import type { TaskStatus } from "@/generated/prisma/client";
import { cubStatusBadge } from "@/lib/cub-theme";
import { TASK_STATUS_LABELS } from "@/lib/task-transitions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, string> = {
  AVAILABLE: cubStatusBadge.available,
  CLAIMED: cubStatusBadge.claimed,
  IN_PROGRESS: cubStatusBadge.inProgress,
  SUBMITTED: cubStatusBadge.submitted,
  SENT_BACK: cubStatusBadge.sentBack,
  REJECTED: cubStatusBadge.rejected,
  APPROVED: cubStatusBadge.approved,
  COMPLETED: cubStatusBadge.completed,
};

type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

/** @deprecated Use StatusBadge */
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <StatusBadge status={status} />;
}
