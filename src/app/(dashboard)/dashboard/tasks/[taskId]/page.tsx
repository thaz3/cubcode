import { WaitingForReviewNotice } from "@/components/waiting-for-review-notice";
import { AssignTaskForm } from "@/components/assign-task-form";
import { ChecklistDisplay } from "@/components/checklist-display";
import { CubLink } from "@/components/cub-link";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTaskChecklistItems } from "@/lib/tasks";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import {
  formatTaskCategory,
  getCategorySuggestions,
} from "@/lib/task-categories";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatDueScheduleDate, formatScheduleDate } from "@/lib/task-schedule";
import { isTaskEditable } from "@/lib/task-transitions";
import { notFound, redirect } from "next/navigation";

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const task = await db.task.findFirst({
    where: { id: taskId, familyId: family.id },
    include: {
      cub: true,
      template: true,
      focusBlocks: { orderBy: { startedAt: "desc" } },
    },
  });

  if (!task) notFound();

  const checklistItems = getTaskChecklistItems(task);
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

  const categorySuggestion = getCategorySuggestions(task.category, {
    subcategory: task.subcategory,
    growthCategory: task.growthCategory,
  });

  return (
    <div className="space-y-6">
      {task.status === "SUBMITTED" ? (
        <WaitingForReviewNotice
          taskTitle={task.title}
          reviewHref={`/dashboard/tasks/review/${task.id}`}
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/tasks"
            className="text-sm font-medium text-amber-700"
          >
            ← Task Board
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{task.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskScheduleBadge task={task} />
            {task.cub ? (
              <CubLink
                cubId={task.cub.id}
                displayName={task.cub.displayName}
                className="text-sm text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400"
              />
            ) : null}
          </div>
          {!isAvailable ? (
            <TaskScheduleDisplay task={task} className="mt-2" />
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {isTaskEditable(task.status) ? (
            <Link href={`/dashboard/tasks/${task.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          ) : null}
          {task.status === "SUBMITTED" ? (
            <Link href={`/dashboard/tasks/review/${task.id}`}>
              <Button>Review</Button>
            </Link>
          ) : null}
          {task.cub && !isAvailable ? (
            <Link href={`/dashboard/cubs/${task.cub.id}/tasks`}>
              <Button variant="secondary">Open Cub tasks</Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Task details</h2>

          {task.description ? (
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                {task.description}
              </p>
            </div>
          ) : null}

          {task.template ? (
            <p className="text-sm text-zinc-500">
              From template: {task.template.title}
            </p>
          ) : null}

          <p className="text-sm text-zinc-500">
            Category:{" "}
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}
          </p>

          <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-medium">How to log this task</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {categorySuggestion.logInstructions}
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            Proof style: {formatProofType(task.proofType)}
          </p>

          {task.proofPrompt ? (
            <div>
              <h3 className="text-sm font-medium">Proof instructions</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                {task.proofPrompt}
              </p>
            </div>
          ) : null}

          {checklistItems.length > 0 && !checklist ? (
            <div>
              <h3 className="text-sm font-medium">Checklist items</h3>
              <div className="mt-2">
                <ChecklistDisplay items={checklistItems} preview />
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-medium">Rewards</h3>
            {isAvailable ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Cub profile rewards apply when this task is assigned. Parent
                approval is always required to earn.
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                On approval: {formatTaskRewards(task)}
              </p>
            )}
          </div>

          <TaskTimeline task={task} status={task.status} />
        </Card>

        <div className="space-y-6">
          {isAvailable ? (
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold">Assign to child</h2>
              <p className="text-sm text-zinc-500">
                Choose which Cub should work on this task.
              </p>
              <AssignTaskForm taskId={task.id} cubs={family.cubs} />
            </Card>
          ) : task.cub ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold">Assigned to</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <CubLink cubId={task.cub.id} displayName={task.cub.displayName} />
              </p>
            </Card>
          ) : null}

          {hasSubmission ? (
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold">Submission</h2>

              {task.reflection ? (
                <div>
                  <h3 className="text-sm font-medium">Reflection / notes</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {task.reflection}
                  </p>
                </div>
              ) : null}

              {task.proofLink ? (
                <div>
                  <h3 className="text-sm font-medium">Share link</h3>
                  <a
                    href={task.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-amber-700 break-all"
                  >
                    {task.proofLink}
                  </a>
                </div>
              ) : null}

              {task.timeLoggedMinutes != null ? (
                <p className="text-sm">
                  Time logged: <strong>{task.timeLoggedMinutes} min</strong>
                </p>
              ) : null}

              {checklist && checklistItems.length > 0 ? (
                <ChecklistDisplay items={checklistItems} checked={checklist} />
              ) : null}

              {task.reviewNote ? (
                <p className="rounded-lg bg-orange-50 p-2 text-sm text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                  Parent note: {task.reviewNote}
                </p>
              ) : null}
            </Card>
          ) : null}

          {task.focusBlocks.length > 0 ? (
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold">Focus Blocks</h2>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {task.focusBlocks.map((block) => (
                  <li key={block.id}>
                    {block.durationMinutes} min ·{" "}
                    {block.startedAt.toLocaleString()}
                    {block.note ? ` · ${block.note}` : ""}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TaskTimeline({
  task,
  status,
}: {
  task: {
    claimedAt: Date | null;
    dueAt: Date | null;
    startedAt: Date | null;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    createdAt: Date;
  };
  status: string;
}) {
  const events = [
    { label: "Added to board", at: task.createdAt },
    task.claimedAt ? { label: "Assigned", at: task.claimedAt } : null,
    task.dueAt ? { label: `Due ${formatDueScheduleDate(task.dueAt)}`, at: task.dueAt } : null,
    task.startedAt ? { label: "Started", at: task.startedAt } : null,
    task.submittedAt
      ? {
          label:
            status === "SUBMITTED"
              ? "Submitted — waiting for review"
              : "Submitted",
          at: task.submittedAt,
        }
      : null,
    task.reviewedAt ? { label: "Reviewed", at: task.reviewedAt } : null,
  ].filter(Boolean) as Array<{ label: string; at: Date }>;

  if (events.length <= 1) return null;

  return (
    <div>
      <h3 className="text-sm font-medium">Timeline</h3>
      <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        {events.map((event) => (
          <li key={event.label}>
            {event.label} · {event.at.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
