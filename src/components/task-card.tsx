import Link from "next/link";
import { AssignmentManageActions } from "@/components/assignment-manage-actions";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { CubLink } from "@/components/cub-link";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatTaskCategory } from "@/lib/task-categories";
import { cubLink } from "@/lib/cub-theme";
import { getTaskEarnType } from "@/lib/earn-types";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { getTaskScheduleSummary } from "@/lib/task-schedule";
import type { TaskWithCub } from "@/lib/task-groups";
import type { TaskStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskWithCub;
  /** Optional server action form for start task */
  startAction?: React.ReactNode;
  /** Optional submit form for in-progress tasks */
  submitSlot?: React.ReactNode;
  compact?: boolean;
  /** Tighter layout for the assignments board grid */
  board?: boolean;
};

export function TaskCard({
  task,
  startAction,
  submitSlot,
  compact = false,
  board = false,
}: TaskCardProps) {
  const earnType = getTaskEarnType(task);
  const schedule = getTaskScheduleSummary(task);
  const isCompact = compact || board;
  const cardVariant =
    task.isUrgent && schedule.timingTone === "overdue"
      ? "urgent"
      : task.status === "IN_PROGRESS"
        ? "constructive"
        : "accent";
  const buttonSize = board ? "md" : "lg";

  return (
    <Card
      variant={cardVariant}
      className={cn(board ? "space-y-3 !p-4" : "space-y-4")}
    >
      <div className={cn(board ? "space-y-1.5" : "space-y-2")}>
        <div className="flex flex-wrap items-center gap-2">
          <EarnTypeBadge earnType={earnType} />
          <h2
            className={cn(
              "font-semibold text-cub-off-white",
              board ? "text-base" : "text-lg",
            )}
          >
            {task.title}
          </h2>
          <StatusBadge status={task.status} />
          {task.isUrgent ? <TaskUrgentBadge /> : null}
        </div>

        <p className="text-sm text-cub-muted">
          {task.cub ? (
            <>
              <CubLink
                cubId={task.cub.id}
                displayName={task.cub.displayName}
                className={cubLink}
              />{" "}
              ·{" "}
              {formatTaskCategory(task.category, {
                subcategory: task.subcategory,
                growthCategory: task.growthCategory,
              })}{" "}
              · {formatProofType(task.proofType)}
            </>
          ) : (
            <>
              Unassigned ·{" "}
              {formatTaskCategory(task.category, {
                subcategory: task.subcategory,
                growthCategory: task.growthCategory,
              })}{" "}
              · {formatProofType(task.proofType)}
            </>
          )}
        </p>

        {!isCompact ? (
          <p className="text-sm text-cub-gold/90">{formatTaskRewards(task)}</p>
        ) : null}

        <TaskScheduleDisplay task={task} inline />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">{getPrimaryAction(task, buttonSize)}</div>
        <Link href={`/dashboard/tasks/${task.id}`} className="flex-1">
          <Button variant="neutral" fullWidth size={buttonSize}>
            Details
          </Button>
        </Link>
      </div>

      {!board ? (
        <AssignmentManageActions
          taskId={task.id}
          status={task.status}
          fullWidth
        />
      ) : null}

      {startAction}
      {submitSlot}
    </Card>
  );
}

function getPrimaryAction(
  task: TaskWithCub,
  size: "md" | "lg" = "lg",
): React.ReactNode {
  const href = `/dashboard/tasks/${task.id}`;
  const cubTasksHref = task.cub
    ? `/dashboard/cubs/${task.cub.id}/tasks`
    : href;

  switch (task.status as TaskStatus) {
    case "AVAILABLE":
      return (
        <Link href={href} className="block">
          <Button fullWidth size={size}>
            Assign
          </Button>
        </Link>
      );
    case "CLAIMED":
    case "SENT_BACK":
      return (
        <Link href={cubTasksHref} className="block">
          <Button variant="constructive" fullWidth size={size}>
            {task.status === "SENT_BACK" ? "Fix & resubmit" : "View instructions"}
          </Button>
        </Link>
      );
    case "IN_PROGRESS":
      return (
        <Link href={cubTasksHref} className="block">
          <Button variant="constructive" fullWidth size={size}>
            Submit task
          </Button>
        </Link>
      );
    case "SUBMITTED":
      return (
        <Link href={`/dashboard/tasks/review/${task.id}`} className="block">
          <Button variant="constructive" fullWidth size={size}>
            Review
          </Button>
        </Link>
      );
    default:
      return (
        <Link href={href} className="block">
          <Button variant="neutral" fullWidth size={size}>
            View
          </Button>
        </Link>
      );
  }
}
