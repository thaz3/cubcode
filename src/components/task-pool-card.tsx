import Link from "next/link";
import { AssignTaskForm } from "@/components/assign-task-form";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteAvailableTaskAction } from "@/lib/actions/tasks";
import { formatTaskCategory } from "@/lib/task-categories";
import { formatProofType } from "@/lib/task-labels";
import type { TaskWithCub } from "@/lib/task-groups";

type TaskPoolCardProps = {
  task: TaskWithCub;
  cubs: Array<{ id: string; displayName: string }>;
};

export function TaskPoolCard({ task, cubs }: TaskPoolCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="font-medium hover:text-amber-700"
            >
              {task.title}
            </Link>
            <TaskStatusBadge status={task.status} />
          </div>
          {task.description ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-zinc-500">
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}{" "}
            · {formatProofType(task.proofType)} · Cub rewards apply when assigned
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/tasks/${task.id}`}>
            <Button variant="secondary">View</Button>
          </Link>
          <Link href={`/dashboard/tasks/${task.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium">Assign to Cub</p>
          <div className="mt-3">
            <AssignTaskForm taskId={task.id} cubs={cubs} />
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await deleteAvailableTaskAction(task.id);
          }}
        >
          <Button type="submit" variant="danger">
            Delete from board
          </Button>
        </form>
      </div>
    </Card>
  );
}
