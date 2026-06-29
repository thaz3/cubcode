"use client";

import { EarnTypeBadge } from "@/components/earn-type-badge";
import { RequestSessionTimer } from "@/components/request-session-timer";
import { CancelFocusSessionForm } from "@/components/cancel-focus-session-form";
import { StartTaskForm } from "@/components/start-task-form";
import { TaskInstructionsPanel } from "@/components/task-instructions-panel";
import { TaskSubmitForm } from "@/components/task-workflow-forms";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { formatTaskCategory, GROWTH_CATEGORY_LABELS } from "@/lib/task-categories";
import { toIsoString } from "@/lib/coerce-date";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { cubStatusMessage } from "@/lib/cub-next-action";
import { getTaskEarnType } from "@/lib/earn-types";
import type { GrowthCategory, Task, TaskStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

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
  | "dueAtHasTime"
  | "xpEarned"
  | "focusTokensEarned"
  | "phoneMinutesEarned"
  | "focusMinutesEarned"
  | "reviewNote"
  | "focusActivityCardId"
  | "trainingDeckId"
> & {
  dueAt: Date | string | null;
  claimedAt: Date | string | null;
  createdAt: Date | string;
  focusSessionStartedAt?: Date | string | null;
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
  const isRequestActive = Boolean(
    task.status === "IN_PROGRESS" && task.focusSessionStartedAt,
  );
  const statusMsg = cubStatusMessage(task.status as TaskStatus);
  const isFocusBlock = task.category === "FOCUS_BLOCK";
  const earnType = getTaskEarnType(task);
  const instructionsVisible = task.status === "IN_PROGRESS";

  const focusStartedIso = toIsoString(task.focusSessionStartedAt);

  return (
    <Card
      className={cn(
        "rounded-2xl border-2 shadow-md",
        cubAccentClassNames(cubId, {
          border: true,
          cardTint: isRequestActive,
        }),
      )}
    >
      <div className="space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <EarnTypeBadge earnType={earnType} />
            <h2 className="text-lg font-semibold text-zinc-50">{task.title}</h2>
            <StatusBadge status={task.status} />
            <TaskScheduleBadge task={task} />
          </div>
          <TaskScheduleDisplay task={task} className="mt-1" />
          {statusMsg ? (
            <p className="mt-2 text-sm text-zinc-300">{statusMsg}</p>
          ) : null}
        </div>

        {isRequestActive && focusStartedIso ? (
          <div className="rounded-xl border border-cub-green/30 bg-cub-green-muted px-4 py-3">
            {task.growthCategory ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cub-green-light">
                {GROWTH_CATEGORY_LABELS[task.growthCategory].split(" —")[0]}
              </p>
            ) : null}
            <RequestSessionTimer
              startedAt={focusStartedIso}
              label="Request timer"
            />
            <p className="mt-2 text-xs text-cub-green-light/80">
              Your parent can see when you opened these instructions.
            </p>
          </div>
        ) : null}

        {instructionsVisible ? <TaskInstructionsPanel task={task} /> : null}

        <p className="text-sm text-zinc-500">
          {formatTaskCategory(task.category, {
            subcategory: task.subcategory,
            growthCategory: task.growthCategory,
          })}{" "}
          · {isFocusBlock ? "Reflection + proof link" : formatProofType(task.proofType)}
        </p>
        <p className="text-sm text-cub-gold/90">
          Earn on approval: {formatTaskRewards(task)}
          {isFocusBlock && focusGrowth
            ? " (shared across weekly growth areas)"
            : ""}
        </p>

        {focusGrowth && isFocusBlock ? (
          <p className="text-xs text-zinc-500">{focusGrowth.weekProgressLabel}</p>
        ) : null}

        {focusMinutes > 0 ? (
          <p className="text-xs text-zinc-500">{focusMinutes} min logged</p>
        ) : null}

        {task.status === "SENT_BACK" && task.reviewNote ? (
          <p className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted px-3 py-2 text-sm text-cub-gold-light">
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
          <>
            {isFocusBlock ? (
              <CancelFocusSessionForm cubId={cubId} taskId={task.id} />
            ) : null}
            <TaskSubmitForm
              task={task as Parameters<typeof TaskSubmitForm>[0]["task"]}
              audience="cub"
            />
          </>
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
