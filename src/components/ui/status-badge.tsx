import type { TaskStatus } from "@/generated/prisma/client";
import { TASK_STATUS_LABELS } from "@/lib/task-transitions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, string> = {
  AVAILABLE: "bg-zinc-800 text-zinc-300",
  CLAIMED: "bg-blue-950 text-blue-300",
  IN_PROGRESS: "bg-indigo-950 text-indigo-300",
  SUBMITTED: "bg-amber-950 text-amber-300",
  SENT_BACK: "bg-orange-950 text-orange-300",
  REJECTED: "bg-red-950 text-red-300",
  APPROVED: "bg-green-950 text-green-300",
  COMPLETED: "bg-emerald-950 text-emerald-300",
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
