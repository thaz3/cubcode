import { FocusSessionTimer } from "@/components/focus-session-timer";
import { TaskSubmitForm } from "@/components/task-workflow-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { startTaskAction } from "@/lib/actions/tasks";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { cubStatusMessage } from "@/lib/cub-next-action";
import type { Task, TaskStatus } from "@/generated/prisma/client";

type CubWorkflowTask = Pick<
  Task,
  | "id"
  | "title"
  | "description"
  | "status"
  | "category"
  | "subcategory"
  | "growthCategory"
  | "proofType"
  | "proofPrompt"
  | "proofChecklistItems"
  | "dueAt"
  | "dueAtHasTime"
  | "claimedAt"
  | "createdAt"
  | "xpEarned"
  | "focusTokensEarned"
  | "phoneMinutesEarned"
  | "focusMinutesEarned"
  | "focusSessionStartedAt"
  | "reviewNote"
> & {
  focusBlocks: Array<{ durationMinutes: number }>;
};

type CubWorkflowTaskCardProps = {
  task: CubWorkflowTask;
  cubId: string;
};

export function CubWorkflowTaskCard({ task, cubId }: CubWorkflowTaskCardProps) {
  const focusMinutes = task.focusBlocks.reduce(
    (sum, block) => sum + block.durationMinutes,
    0,
  );
  const isTimerRunning = Boolean(
    task.status === "IN_PROGRESS" && task.focusSessionStartedAt,
  );
  const statusMsg = cubStatusMessage(task.status as TaskStatus);

  return (
    <Card
      className={cubAccentClassNames(cubId, {
        border: true,
        cardTint: isTimerRunning,
      })}
    >
      <div className="space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-50">{task.title}</h2>
            <StatusBadge status={task.status} />
            <TaskScheduleBadge task={task} />
          </div>
          <TaskScheduleDisplay task={task} className="mt-1" />
          {statusMsg ? (
            <p className="mt-2 text-sm text-zinc-300">{statusMsg}</p>
          ) : null}
        </div>

        {isTimerRunning && task.focusSessionStartedAt ? (
          <div className="rounded-xl border border-indigo-800/60 bg-indigo-950/30 px-4 py-3">
            <FocusSessionTimer
              startedAt={task.focusSessionStartedAt.toISOString()}
              label="Focus timer"
            />
          </div>
        ) : null}

        {task.description ? (
          <p className="text-sm text-zinc-400">{task.description}</p>
        ) : null}

        <p className="text-sm text-zinc-500">
          {formatTaskCategory(task.category, {
            subcategory: task.subcategory,
            growthCategory: task.growthCategory,
          })}{" "}
          · {formatProofType(task.proofType)}
        </p>
        <p className="text-sm text-amber-500/90">
          Earn on approval: {formatTaskRewards(task)}
        </p>

        {focusMinutes > 0 ? (
          <p className="text-xs text-zinc-500">{focusMinutes} min focus logged</p>
        ) : null}

        {task.status === "SENT_BACK" && task.reviewNote ? (
          <p className="rounded-xl bg-orange-950/40 px-3 py-2 text-sm text-orange-200">
            Parent note: {task.reviewNote}
          </p>
        ) : null}

        {(task.status === "CLAIMED" || task.status === "SENT_BACK") && (
          <form
            action={async () => {
              "use server";
              await startTaskAction(task.id);
            }}
          >
            <Button type="submit" fullWidth size="lg">
              {task.status === "SENT_BACK" ? "Start again" : "Start focus"}
            </Button>
          </form>
        )}

        {task.status === "IN_PROGRESS" && (
          <TaskSubmitForm task={task} audience="cub" />
        )}

        {["SUBMITTED", "APPROVED", "COMPLETED", "REJECTED"].includes(
          task.status,
        ) ? (
          <p className="text-sm text-zinc-500">
            {task.status === "SUBMITTED"
              ? "Your parent will review this soon."
              : task.status === "COMPLETED" || task.status === "APPROVED"
                ? "Great work — rewards are on the way!"
                : "Talk with your parent about what to do next."}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
