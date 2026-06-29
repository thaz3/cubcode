import Link from "next/link";
import { AssignmentManageActions } from "@/components/assignment-manage-actions";
import { ParentFocusSessionControls } from "@/components/parent-focus-session-controls";
import { WaitingForReviewNotice } from "@/components/waiting-for-review-notice";
import { AssignTaskForm } from "@/components/assign-task-form";
import { ChecklistDisplay } from "@/components/checklist-display";
import { CubLink } from "@/components/cub-link";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PageHeader } from "@/components/ui/page-header";
import { TaskSubmitForm } from "@/components/task-workflow-forms";
import {
  TaskScheduleBadge,
  TaskScheduleDisplay,
} from "@/components/task-schedule-display";
import { formatTaskCategory, getCategorySuggestions } from "@/lib/task-categories";
import { cubLink, cubSectionLabel } from "@/lib/cub-theme";
import { getTaskEarnType } from "@/lib/earn-types";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import {
  getEffectiveTaskRewards,
  OVERDUE_REWARD_PENALTY_LABEL,
} from "@/lib/task-rewards";
import { formatDueScheduleDate } from "@/lib/task-schedule";
import type { Cub, Task, TaskStatus, TaskTemplate } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type FocusBlockRow = {
  id: string;
  durationMinutes: number;
  startedAt: Date;
  note: string | null;
};

type TaskDetailViewProps = {
  task: Task & {
    cub: Cub | null;
    template: TaskTemplate | null;
    focusBlocks: FocusBlockRow[];
  };
  familyCubs: Cub[];
  checklistItems: string[];
};

export function TaskDetailView({
  task,
  familyCubs,
  checklistItems,
}: TaskDetailViewProps) {
  const checklist =
    task.checklistData && typeof task.checklistData === "object"
      ? (task.checklistData as Record<string, boolean>)
      : null;

  const isAvailable = task.status === "AVAILABLE";
  const hasSubmission = [
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "SENT_BACK",
  ].includes(task.status);
  const isFinished = task.status === "COMPLETED" || task.status === "APPROVED";
  const categorySuggestion = getCategorySuggestions(task.category, {
    subcategory: task.subcategory,
    growthCategory: task.growthCategory,
  });
  const isFocusBlock = task.category === "FOCUS_BLOCK";
  const canManageFocusSession =
    isFocusBlock &&
    task.cub &&
    (task.status === "CLAIMED" || task.status === "IN_PROGRESS");
  const earnType = getTaskEarnType(task);
  const heroVariant = getHeroVariant(task.status);

  return (
    <div className="space-y-6">
      {task.status === "SUBMITTED" ? (
        <WaitingForReviewNotice
          taskTitle={task.title}
          reviewHref={`/dashboard/tasks/review/${task.id}`}
        />
      ) : null}

      <PageHeader
        title={task.title}
        backHref="/dashboard/tasks"
        backLabel="Assignments"
        action={
          <div className="flex flex-wrap gap-2">
            <AssignmentManageActions
              taskId={task.id}
              status={task.status}
              size="sm"
            />
            {task.status === "SUBMITTED" ? (
              <Link href={`/dashboard/tasks/review/${task.id}`}>
                <Button size="sm">Review</Button>
              </Link>
            ) : null}
            {task.cub && !isAvailable ? (
              <Link href={`/dashboard/cubs/${task.cub.id}/tasks`}>
                <Button variant="secondary" size="sm">
                  Open Cub tasks
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <Card variant={heroVariant} className="space-y-4 !p-5">
        <div className="flex flex-wrap items-center gap-2">
          <EarnTypeBadge earnType={earnType} />
          <StatusBadge status={task.status} />
          <TaskScheduleBadge task={task} />
        </div>

        {task.cub ? (
          <p className="text-sm text-cub-muted">
            Assigned to{" "}
            <CubLink
              cubId={task.cub.id}
              displayName={task.cub.displayName}
              className={cubLink}
            />
          </p>
        ) : null}

        {!isAvailable ? (
          <TaskScheduleDisplay task={task} inline className="text-sm" />
        ) : null}

        {isFinished ? (
          <p className="text-sm font-medium text-cub-green-light">
            This task is complete — rewards were credited on approval.
          </p>
        ) : null}

        {!isAvailable ? <TaskRewardChips task={task} /> : null}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <DetailPanel title="About this task">
            <div className="flex flex-wrap gap-2">
              <MetaPill
                label="Category"
                value={formatTaskCategory(task.category, {
                  subcategory: task.subcategory,
                  growthCategory: task.growthCategory,
                })}
              />
              <MetaPill label="Proof" value={formatProofType(task.proofType)} />
            </div>

            {task.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-cub-off-white/90">
                {task.description}
              </p>
            ) : null}

            {task.template ? (
              <p className="text-sm text-cub-muted">
                From template:{" "}
                <span className="text-cub-off-white">{task.template.title}</span>
              </p>
            ) : null}

            <div className="rounded-xl border border-cub-gold/25 bg-cub-gold-muted/40 p-4">
              <p className={cn(cubSectionLabel, "text-cub-gold")}>
                How to log this task
              </p>
              <p className="mt-2 text-sm leading-relaxed text-cub-off-white/90">
                {categorySuggestion.logInstructions}
              </p>
            </div>

            {task.proofPrompt ? (
              <div>
                <p className={cubSectionLabel}>Proof instructions</p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-cub-muted">
                  {task.proofPrompt}
                </p>
              </div>
            ) : null}

            {checklistItems.length > 0 && !checklist ? (
              <div>
                <p className={cn(cubSectionLabel, "mb-3")}>Checklist items</p>
                <ChecklistDisplay items={checklistItems} preview />
              </div>
            ) : null}

            {isAvailable ? (
              <p className="text-sm text-cub-muted">
                Cub profile rewards apply when this task is assigned. Parent
                approval is always required to earn.
              </p>
            ) : null}
          </DetailPanel>

          <CollapsibleSection
            title="Timeline"
            summary={getTimelineSummary(task, task.status)}
            badge={getTimelineEventCount(task, task.status)}
            defaultOpen={false}
            className="border-cub-charcoal/90 cub-card-surface shadow-md shadow-black/25"
          >
            <TaskDetailTimeline task={task} status={task.status} />
          </CollapsibleSection>
        </div>

        <div className="space-y-5">
          {canManageFocusSession ? (
            <ParentFocusSessionControls
              taskId={task.id}
              cubName={task.cub!.displayName}
              focusSessionStartedAt={
                task.focusSessionStartedAt?.toISOString() ?? null
              }
              canEnd
            />
          ) : null}

          {isAvailable ? (
            <DetailPanel title="Assign to child">
              <p className="text-sm text-cub-muted">
                Choose which Cub should work on this task.
              </p>
              <AssignTaskForm taskId={task.id} cubs={familyCubs} />
            </DetailPanel>
          ) : task.cub ? (
            <DetailPanel title="Assigned to">
              <CubLink
                cubId={task.cub.id}
                displayName={task.cub.displayName}
                className={cn(cubLink, "text-base")}
              />
            </DetailPanel>
          ) : null}

          {hasSubmission ? (
            <DetailPanel title="Submission">
              {task.reflection ? (
                <div className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 p-4">
                  <p className={cubSectionLabel}>Reflection</p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-cub-off-white">
                    {task.reflection}
                  </p>
                </div>
              ) : null}

              {task.proofLink ? (
                <div>
                  <p className={cubSectionLabel}>Share link</p>
                  <a
                    href={task.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-sm break-all text-cub-gold-light hover:text-cub-gold-warm"
                  >
                    {task.proofLink}
                  </a>
                </div>
              ) : null}

              {task.timeLoggedMinutes != null ? (
                <MetaPill
                  label="Time logged"
                  value={`${task.timeLoggedMinutes} min`}
                />
              ) : null}

              {checklist && checklistItems.length > 0 ? (
                <ChecklistDisplay items={checklistItems} checked={checklist} />
              ) : null}

              {task.reviewNote ? (
                <p className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted/30 p-3 text-sm text-cub-gold-light">
                  Parent note: {task.reviewNote}
                </p>
              ) : null}
            </DetailPanel>
          ) : null}

          {task.status === "IN_PROGRESS" && task.cub ? (
            <DetailPanel title="Submit on their behalf">
              <p className="text-sm text-cub-muted">
                For supervised work when {task.cub.displayName} isn&apos;t on
                their device. This sends the task to your review queue — same as
                if they submitted from Cub view.
              </p>
              <TaskSubmitForm task={task} audience="parent" />
            </DetailPanel>
          ) : null}

          {task.focusBlocks.length > 0 ? (
            <DetailPanel title="Focus blocks">
              <ul className="space-y-2">
                {task.focusBlocks.map((block) => (
                  <li
                    key={block.id}
                    className="rounded-xl border border-cub-green-bright/20 bg-cub-green-muted/20 px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-cub-green-light">
                      {block.durationMinutes} min
                    </span>
                    <span className="text-cub-muted">
                      {" "}
                      · {block.startedAt.toLocaleString()}
                    </span>
                    {block.note ? (
                      <p className="mt-1 text-cub-muted">{block.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </DetailPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getHeroVariant(
  status: TaskStatus,
): "constructive" | "accent" | "urgent" | "default" {
  if (status === "COMPLETED" || status === "APPROVED") return "constructive";
  if (status === "SUBMITTED") return "accent";
  if (status === "SENT_BACK" || status === "REJECTED") return "urgent";
  if (status === "IN_PROGRESS") return "constructive";
  return "accent";
}

function DetailPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 !p-5">
      <h2 className="text-lg font-semibold text-cub-off-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/60 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-cub-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-cub-off-white">{value}</p>
    </div>
  );
}

function TaskRewardChips({ task }: { task: TaskRewardContextFields }) {
  const rewards = getEffectiveTaskRewards(task);

  const chips = [
    { label: "Focus", value: `${rewards.focusMinutesEarned} min`, tone: "green" },
    { label: "Phone", value: `${rewards.phoneMinutesEarned} min`, tone: "gold" },
    { label: "XP", value: String(rewards.xpEarned), tone: "gold" },
    {
      label: "Tokens",
      value: String(rewards.focusTokensEarned),
      tone: "gold",
    },
  ] as const;

  return (
    <div className="space-y-2">
      <p className={cubSectionLabel}>Rewards on approval</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={cn(
              "inline-flex flex-col rounded-xl border px-3 py-2",
              chip.tone === "green"
                ? "border-cub-green-bright/30 bg-cub-green-muted/40"
                : "border-cub-gold/30 bg-cub-gold-muted/40",
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-cub-muted">
              {chip.label}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                chip.tone === "green"
                  ? "text-cub-green-light"
                  : "text-cub-gold-light",
              )}
            >
              {chip.value}
            </span>
          </span>
        ))}
      </div>
      {rewards.penalizedForLateSubmission ? (
        <p className="text-xs text-cub-gold-light/90">
          {OVERDUE_REWARD_PENALTY_LABEL} — {formatTaskRewards(task)}
        </p>
      ) : null}
    </div>
  );
}

type TaskRewardContextFields = Task & {
  dueAt: Date | null;
  submittedAt: Date | null;
};

type TaskTimelineFields = {
  claimedAt: Date | null;
  dueAt: Date | null;
  startedAt: Date | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

type TimelineEvent = {
  label: string;
  at: Date;
  tone: "muted" | "gold" | "green";
};

function buildTaskTimelineEvents(
  task: TaskTimelineFields,
  status: TaskStatus,
): TimelineEvent[] {
  return [
    { label: "Added to board", at: task.createdAt, tone: "muted" },
    task.claimedAt
      ? { label: "Assigned", at: task.claimedAt, tone: "gold" }
      : null,
    task.dueAt
      ? {
          label: `Due ${formatDueScheduleDate(task.dueAt)}`,
          at: task.dueAt,
          tone: "muted",
        }
      : null,
    task.startedAt
      ? { label: "Started", at: task.startedAt, tone: "green" }
      : null,
    task.submittedAt
      ? {
          label:
            status === "SUBMITTED"
              ? "Submitted — waiting for review"
              : "Submitted",
          at: task.submittedAt,
          tone: "gold",
        }
      : null,
    task.reviewedAt
      ? { label: "Reviewed", at: task.reviewedAt, tone: "green" }
      : null,
  ].filter(Boolean) as TimelineEvent[];
}

function getTimelineSummary(task: TaskTimelineFields, status: TaskStatus): string {
  const events = buildTaskTimelineEvents(task, status);
  if (events.length <= 1) {
    return "No activity recorded yet";
  }
  const latest = events[events.length - 1]!;
  return `${latest.label} · ${latest.at.toLocaleString()}`;
}

function getTimelineEventCount(
  task: TaskTimelineFields,
  status: TaskStatus,
): number | undefined {
  const count = buildTaskTimelineEvents(task, status).length;
  return count > 1 ? count : undefined;
}

function TaskDetailTimeline({
  task,
  status,
}: {
  task: TaskTimelineFields;
  status: TaskStatus;
}) {
  const events = buildTaskTimelineEvents(task, status);

  if (events.length <= 1) {
    return (
      <p className="text-sm text-cub-muted">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const dotClass =
          event.tone === "green"
            ? "bg-cub-green-bright ring-cub-green-bright/30"
            : event.tone === "gold"
              ? "bg-cub-gold ring-cub-gold/30"
              : "bg-cub-charcoal ring-cub-off-white/20";

        return (
          <li key={`${event.label}-${event.at.toISOString()}`} className="relative flex gap-4 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-0.5rem)] w-px bg-cub-off-white/15"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4",
                dotClass,
                isLast && event.tone === "green" ? "shadow-md shadow-cub-green/30" : null,
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  isLast && event.tone === "green"
                    ? "text-cub-green-light"
                    : "text-cub-off-white",
                )}
              >
                {event.label}
              </p>
              <p className="mt-0.5 text-xs text-cub-muted">
                {event.at.toLocaleString()}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
