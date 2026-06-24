import Link from "next/link";
import { AssignTaskForm } from "@/components/assign-task-form";
import { CubLink } from "@/components/cub-link";
import { TaskTemplateForm } from "@/components/task-template-form";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Card } from "@/components/ui/card";
import { updateTaskAction } from "@/lib/actions/tasks";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatDueDateInputValue } from "@/lib/task-schedule";
import { isTaskEditable } from "@/lib/task-transitions";
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

  if (!task || !isTaskEditable(task.status)) {
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
              className="text-sm text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400"
            />
          ) : null}
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {isAvailable
            ? "Update this task while it is still in the available pool."
            : "Update category, proof, and instructions while this task is in progress or sent back for revision. Tasks waiting for review or already decided cannot be edited."}
        </p>
      </div>

      {!isAvailable && task.cub ? (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          Assigned to{" "}
          <CubLink cubId={task.cub.id} displayName={task.cub.displayName} />.
          Reward amounts
          on this task were set when it was assigned; edit the Cub profile to
          change default rewards for future tasks.
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
    </div>
  );
}
