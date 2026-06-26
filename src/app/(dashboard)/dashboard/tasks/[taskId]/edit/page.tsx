import Link from "next/link";
import { AssignmentManageActions } from "@/components/assignment-manage-actions";
import { AssignTaskForm } from "@/components/assign-task-form";
import { CubLink } from "@/components/cub-link";
import { TaskTemplateForm } from "@/components/task-template-form";
import { TaskRewardFields } from "@/components/task-reward-fields";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Card } from "@/components/ui/card";
import { updateTaskAction } from "@/lib/actions/tasks";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatDueDateInputValue } from "@/lib/task-schedule";
import { notFound, redirect } from "next/navigation";

type EditTaskPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const task = await db.task.findFirst({
    where: { id: taskId, familyId: family.id },
    include: { cub: true },
  });

  if (!task) {
    notFound();
  }

  const boundUpdate = updateTaskAction.bind(null, taskId);
  const isAvailable = task.status === "AVAILABLE";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/tasks/${taskId}`}
          className="text-sm font-medium text-amber-700"
        >
          ← View task
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Edit task</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={task.status} />
          {task.cub ? (
            <CubLink
              cubId={task.cub.id}
              displayName={task.cub.displayName}
              className="text-sm text-zinc-500 hover:text-amber-700 dark:hover:text-cub-gold-light"
            />
          ) : null}
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {isAvailable
            ? "Update this task while it is still in the available pool."
            : task.status === "SUBMITTED"
              ? "Update instructions or rewards before you review. Deleting removes the submission."
              : task.status === "APPROVED" ||
                  task.status === "COMPLETED" ||
                  task.status === "REJECTED"
                ? "Update the record for your household. Earned rewards are not changed automatically."
                : "Update category, proof, and instructions for this assignment."}
        </p>
      </div>

      {!isAvailable && task.cub ? (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          Assigned to{" "}
          <CubLink cubId={task.cub.id} displayName={task.cub.displayName} />.
          Adjust rewards below to match your household scale for this task.
        </Card>
      ) : null}

      <Card>
        <TaskTemplateForm
          action={boundUpdate}
          submitLabel="Save task"
          initialValues={{
            title: task.title,
            description: task.description ?? "",
            category: task.category,
            subcategory: task.subcategory ?? undefined,
            growthCategory: task.growthCategory ?? undefined,
            proofType: task.proofType,
            proofPrompt: task.proofPrompt ?? "",
            proofChecklistItems: Array.isArray(task.proofChecklistItems)
              ? (task.proofChecklistItems as string[])
              : [],
          }}
          showDueDate={!isAvailable}
          initialDueDate={formatDueDateInputValue(task.dueAt, task.dueAtHasTime)}
          rewardFields={
            <TaskRewardFields
              initialValues={{
                focusMinutesEarned: task.focusMinutesEarned,
                phoneMinutesEarned: task.phoneMinutesEarned,
                xpEarned: task.xpEarned,
                focusTokensEarned: task.focusTokensEarned,
              }}
            />
          }
        />
      </Card>

      {isAvailable ? (
        <Card>
          <h2 className="text-lg font-semibold">Assign to child</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pick which Cub should work on this task. It leaves the available pool
            and moves to that Cub&apos;s task list.
          </p>
          <div className="mt-4">
            <AssignTaskForm taskId={task.id} cubs={family.cubs} />
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Remove assignment</h2>
        <p className="text-sm text-zinc-500">
          Permanently delete this assignment from your household board.
        </p>
        <AssignmentManageActions
          taskId={task.id}
          status={task.status}
          showEdit={false}
          fullWidth
        />
      </Card>
    </div>
  );
}
