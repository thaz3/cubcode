import Link from "next/link";
import { AssignmentManageActions } from "@/components/assignment-manage-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatTaskCategory } from "@/lib/task-categories";
import { formatProofType } from "@/lib/task-labels";
import type { TaskWithCub } from "@/lib/task-groups";

type CompactLibraryTaskCardProps = {
  task: TaskWithCub;
};

export function CompactLibraryTaskCard({ task }: CompactLibraryTaskCardProps) {
  return (
    <Card className="p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="font-medium text-zinc-50 hover:text-cub-gold-light"
            >
              {task.title}
            </Link>
            <StatusBadge status={task.status} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {formatTaskCategory(task.category, {
              subcategory: task.subcategory,
              growthCategory: task.growthCategory,
            })}{" "}
            · {formatProofType(task.proofType)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href={`/dashboard/tasks/${task.id}`}>
            <Button size="sm">Assign</Button>
          </Link>
          <AssignmentManageActions
            taskId={task.id}
            status={task.status}
            size="sm"
          />
        </div>
      </div>
    </Card>
  );
}
