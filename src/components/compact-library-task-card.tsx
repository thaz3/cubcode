import Link from "next/link";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatTaskCategory } from "@/lib/task-categories";
import { getTaskEarnType } from "@/lib/earn-types";
import { formatProofType } from "@/lib/task-labels";
import type { TaskWithCub } from "@/lib/task-groups";

type CompactLibraryTaskCardProps = {
  task: TaskWithCub;
};

export function CompactLibraryTaskCard({ task }: CompactLibraryTaskCardProps) {
  const earnType = getTaskEarnType(task);

  return (
    <Card variant="accent" className="space-y-3 !p-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <EarnTypeBadge earnType={earnType} />
          <h2 className="text-base font-semibold text-cub-off-white">{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-sm text-cub-muted">
          {formatTaskCategory(task.category, {
            subcategory: task.subcategory,
            growthCategory: task.growthCategory,
          })}{" "}
          · {formatProofType(task.proofType)}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/dashboard/tasks/${task.id}`} className="flex-1">
          <Button fullWidth size="md">
            Assign
          </Button>
        </Link>
        <Link href={`/dashboard/tasks/${task.id}`} className="flex-1">
          <Button variant="neutral" fullWidth size="md">
            Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
