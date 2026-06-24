import Link from "next/link";
import { ChecklistDisplay } from "@/components/checklist-display";
import { CubLink } from "@/components/cub-link";
import { OverduePenaltyNotice } from "@/components/overdue-penalty-notice";
import { TaskReviewForm } from "@/components/task-review-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        title={task.title}
        subtitle="Review proof and decide"
        backHref="/dashboard/tasks/review"
        backLabel="Review"
      />
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        {task.cub ? (
          <CubLink
            cubId={task.cub.id}
            displayName={task.cub.displayName}
            className="text-sm text-zinc-400 hover:text-amber-400"
          />
        ) : (
          <span className="text-sm text-zinc-500">Unknown Cub</span>
        )}
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Submission</h2>
          {task.description ? (
            <p className="text-sm text-zinc-400">{task.description}</p>
          ) : null}
          <p className="text-sm text-zinc-500">
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}{" "}
            · Proof: {formatProofType(task.proofType)}
          </p>
          <p className="text-sm text-amber-500/90">
            On approval: {formatTaskRewards(task)}
          </p>
          {submittedLate ? <OverduePenaltyNotice variant="info" /> : null}

          {task.proofPrompt ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Instructions</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">
                {task.proofPrompt}
              </p>
            </div>
          ) : null}

          {task.reflection ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Reflection</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                {task.reflection}
              </p>
            </div>
          ) : null}

          {task.proofLink ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Share link</h3>
              <a
                href={task.proofLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all text-sm text-amber-500"
              >
                {task.proofLink}
              </a>
            </div>
          ) : null}

          {task.timeLoggedMinutes != null ? (
            <p className="text-sm text-zinc-400">
              Time logged:{" "}
              <strong className="text-zinc-200">{task.timeLoggedMinutes} min</strong>
            </p>
          ) : null}

          {checklist && checklistItems.length > 0 ? (
            <ChecklistDisplay items={checklistItems} checked={checklist} />
          ) : null}

          {task.focusBlocks.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Focus Blocks</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
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

        <div>
          {task.status === "SUBMITTED" ? (
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                Your decision
              </h2>
              <TaskReviewForm taskId={task.id} />
            </Card>
          ) : (
            <Card>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>This task is no longer awaiting review.</p>
                {task.reviewNote ? (
                  <p>Parent note: {task.reviewNote}</p>
                ) : null}
                <Link
                  href="/dashboard/tasks/review"
                  className="inline-block font-medium text-amber-500"
                >
                  Back to review inbox
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
