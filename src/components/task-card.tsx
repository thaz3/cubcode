import Link from "next/link";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatTaskCategory } from "@/lib/task-categories";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import type { TaskWithCub } from "@/lib/task-groups";
import type { TaskStatus } from "@/generated/prisma/client";
import { isTaskEditable } from "@/lib/task-transitions";

type TaskCardProps = {
  task: TaskWithCub;
  /** Optional server action form for start task */
  startAction?: React.ReactNode;
  /** Optional submit form for in-progress tasks */
  submitSlot?: React.ReactNode;
  compact?: boolean;
};

export function TaskCard({
  task,
  startAction,
  submitSlot,
  compact = false,
}: TaskCardProps) {
  const primary = getPrimaryAction(task);

  return (
    <Card
      className={cubAccentClassNames(task.cub?.id, {
        border: true,
        cardTint: task.status === "IN_PROGRESS" && Boolean(task.focusSessionStartedAt),
      })}
    >
      <div className="space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="text-base font-semibold text-zinc-50 hover:text-cub-gold-light"
            >
              {task.title}
            </Link>
            <StatusBadge status={task.status} />
            {task.isUrgent ? <TaskUrgentBadge /> : null}
            <TaskScheduleBadge task={task} />
          </div>
          {!compact ? (
            <>
              <TaskScheduleDisplay task={task} compact className="mt-1" />
              <p className="mt-2 text-sm text-zinc-400">
                {formatTaskCategory(task.category, {
                  subcategory: task.subcategory,
                  growthCategory: task.growthCategory,
                })}{" "}
                · {formatProofType(task.proofType)}
              </p>
              <p className="text-sm text-cub-gold/90">
                {formatTaskRewards(task)}
              </p>
            </>
          ) : null}
          {task.cub ? (
            <div className="mt-2">
              <CubColorBadge
                cubId={task.cub.id}
                displayName={task.cub.displayName}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {primary}
          {isTaskEditable(task.status) ? (
            <Link href={`/dashboard/tasks/${task.id}/edit`} className="sm:flex-1">
              <Button variant="secondary" fullWidth size="lg">
                Edit
              </Button>
            </Link>
          ) : null}
        </div>

        {startAction}
        {submitSlot}
      </div>
    </Card>
  );
}

function getPrimaryAction(task: TaskWithCub): React.ReactNode {
  const href = `/dashboard/tasks/${task.id}`;
  const cubTasksHref = task.cub
    ? `/dashboard/cubs/${task.cub.id}/tasks`
    : href;

  switch (task.status as TaskStatus) {
    case "AVAILABLE":
      return (
        <Link href={href} className="flex-1">
          <Button fullWidth size="lg">
            Assign
          </Button>
        </Link>
      );
    case "CLAIMED":
    case "SENT_BACK":
      return (
        <Link href={cubTasksHref} className="flex-1">
          <Button fullWidth size="lg">
            {task.status === "SENT_BACK" ? "Fix & resubmit" : "View instructions"}
          </Button>
        </Link>
      );
    case "IN_PROGRESS":
      return (
        <Link href={cubTasksHref} className="flex-1">
          <Button fullWidth size="lg">
            Submit task
          </Button>
        </Link>
      );
    case "SUBMITTED":
      return (
        <Link href={`/dashboard/tasks/review/${task.id}`} className="flex-1">
          <Button fullWidth size="lg">
            Review
          </Button>
        </Link>
      );
    default:
      return (
        <Link href={href} className="flex-1">
          <Button variant="secondary" fullWidth size="lg">
            View
          </Button>
        </Link>
      );
  }
}
