import { FocusSessionTimer } from "@/components/focus-session-timer";
import { StartTaskForm } from "@/components/start-task-form";
import { TaskSubmitForm } from "@/components/task-workflow-forms";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { formatTaskCategory, GROWTH_CATEGORY_LABELS } from "@/lib/task-categories";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { cubStatusMessage } from "@/lib/cub-next-action";
import type { GrowthCategory, Task, TaskStatus } from "@/generated/prisma/client";

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

export type FocusGrowthContext = {
  availableGrowthAreas: Array<{ value: GrowthCategory; label: string }>;
  weekProgressLabel: string;
};

type CubWorkflowTaskCardProps = {
  task: CubWorkflowTask;
  cubId: string;
  focusGrowth?: FocusGrowthContext | null;
};

export function CubWorkflowTaskCard({
  task,
  cubId,
  focusGrowth = null,
}: CubWorkflowTaskCardProps) {
  const focusMinutes = task.focusBlocks.reduce(
    (sum, block) => sum + block.durationMinutes,
    0,
  );
  const isTimerRunning = Boolean(
    task.status === "IN_PROGRESS" && task.focusSessionStartedAt,
  );
  const statusMsg = cubStatusMessage(task.status as TaskStatus);
  const isFocusBlock = task.category === "FOCUS_BLOCK";

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
            {task.growthCategory ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-300">
                {GROWTH_CATEGORY_LABELS[task.growthCategory].split(" —")[0]}
              </p>
            ) : null}
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
          · {isFocusBlock ? "Reflection + proof link" : formatProofType(task.proofType)}
        </p>
        <p className="text-sm text-amber-500/90">
          Earn on approval: {formatTaskRewards(task)}
          {isFocusBlock && focusGrowth
            ? " (shared across weekly growth areas)"
            : ""}
        </p>

        {focusGrowth && isFocusBlock ? (
          <p className="text-xs text-zinc-500">{focusGrowth.weekProgressLabel}</p>
        ) : null}

        {focusMinutes > 0 ? (
          <p className="text-xs text-zinc-500">{focusMinutes} min focus logged</p>
        ) : null}

        {task.status === "SENT_BACK" && task.reviewNote ? (
          <p className="rounded-xl bg-orange-950/40 px-3 py-2 text-sm text-orange-200">
            Parent note: {task.reviewNote}
          </p>
        ) : null}

        {(task.status === "CLAIMED" || task.status === "SENT_BACK") && (
          <StartTaskForm
            taskId={task.id}
            isFocusBlock={isFocusBlock}
            isResubmit={task.status === "SENT_BACK"}
            availableGrowthAreas={
              isFocusBlock ? focusGrowth?.availableGrowthAreas ?? [] : []
            }
            weekProgressLabel={
              isFocusBlock ? focusGrowth?.weekProgressLabel : undefined
            }
          />
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
