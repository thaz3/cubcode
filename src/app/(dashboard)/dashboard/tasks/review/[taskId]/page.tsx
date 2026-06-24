import Link from "next/link";
import { ChecklistDisplay } from "@/components/checklist-display";
import { CubLink } from "@/components/cub-link";
import { OverduePenaltyNotice } from "@/components/overdue-penalty-notice";
import { TaskReviewForm } from "@/components/task-review-form";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getTaskChecklistItems } from "@/lib/tasks";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { wasTaskSubmittedLate } from "@/lib/task-rewards";
import { notFound, redirect } from "next/navigation";

type ReviewTaskPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function ReviewTaskPage({ params }: ReviewTaskPageProps) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const task = await db.task.findFirst({
    where: { id: taskId, familyId: family.id },
    include: {
      cub: true,
      focusBlocks: { orderBy: { startedAt: "desc" } },
    },
  });

  if (!task) notFound();

  const checklistItems = getTaskChecklistItems(task);
  const checklist =
    task.checklistData && typeof task.checklistData === "object"
      ? (task.checklistData as Record<string, boolean>)
      : null;
  const submittedLate = wasTaskSubmittedLate(task);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/tasks/review" className="text-sm font-medium text-amber-700">
          ← Review queue
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{task.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={task.status} />
          {task.cub ? (
            <CubLink
              cubId={task.cub.id}
              displayName={task.cub.displayName}
              className="text-sm text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400"
            />
          ) : (
            <span className="text-sm text-zinc-500">Unknown Cub</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Submission</h2>
          {task.description ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
          ) : null}
          <p className="text-sm text-zinc-500">
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}{" "}
            · Proof type: {formatProofType(task.proofType)}
          </p>
          <p className="text-sm text-zinc-500">
            On approval: {formatTaskRewards(task)}
          </p>
          {submittedLate ? <OverduePenaltyNotice variant="info" /> : null}

          {task.proofPrompt ? (
            <div>
              <h3 className="text-sm font-medium">Instructions given</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                {task.proofPrompt}
              </p>
            </div>
          ) : null}

          {task.reflection ? (
            <div>
              <h3 className="text-sm font-medium">Reflection / notes</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap">{task.reflection}</p>
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

          {task.focusBlocks.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium">Focus Blocks</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                {task.focusBlocks.map((block) => (
                  <li key={block.id}>
                    {block.durationMinutes} min ·{" "}
                    {block.startedAt.toLocaleString()}
                    {block.note ? ` · ${block.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <Card>
          {task.status === "SUBMITTED" ? (
            <TaskReviewForm taskId={task.id} />
          ) : (
            <div className="space-y-2 text-sm">
              <p>This task is no longer awaiting review.</p>
              {task.reviewNote ? (
                <p className="text-zinc-600">Parent note: {task.reviewNote}</p>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
