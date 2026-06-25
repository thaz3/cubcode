import Link from "next/link";
import { AssignTaskForm } from "@/components/assign-task-form";
import { StatusBadge } from "@/components/ui/status-badge";
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
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="text-lg font-semibold text-zinc-50 hover:text-amber-400"
            >
              {task.title}
            </Link>
            <StatusBadge status={task.status} />
          </div>
          {task.description ? (
            <p className="mt-2 text-sm text-zinc-400">{task.description}</p>
          ) : null}
          <p className="mt-1 text-sm text-zinc-500">
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}{" "}
            · {formatProofType(task.proofType)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="text-sm font-medium text-zinc-200">Assign to Cub</p>
          <div className="mt-3">
            <AssignTaskForm taskId={task.id} cubs={cubs} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/dashboard/tasks/${task.id}`} className="flex-1">
            <Button variant="secondary" fullWidth size="lg">
              View details
            </Button>
          </Link>
          <Link href={`/dashboard/tasks/${task.id}/edit`} className="flex-1">
            <Button variant="secondary" fullWidth size="lg">
              Edit
            </Button>
          </Link>
        </div>

        <form
          action={async () => {
            "use server";
            await deleteAvailableTaskAction(task.id);
          }}
        >
          <Button type="submit" variant="danger" fullWidth size="lg">
            Delete from library
          </Button>
        </form>
      </div>
    </Card>
  );
}
