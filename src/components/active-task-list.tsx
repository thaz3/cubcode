import Link from "next/link";
import { TaskCard } from "@/components/task-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { formatTaskCategory } from "@/lib/task-categories";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatProofType } from "@/lib/task-labels";
import type { ActiveTaskListItem, TaskWithCub } from "@/lib/task-groups";
import { isTaskEditable } from "@/lib/task-transitions";

type ActiveTaskListProps = {
  items: ActiveTaskListItem[];
};

export function ActiveTaskList({ items }: ActiveTaskListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) =>
        item.type === "group" ? (
          <GroupedActiveTaskCard
            key={item.key}
            title={item.title}
            instances={item.instances}
          />
        ) : (
          <TaskCard key={item.task.id} task={item.task} />
        ),
      )}
    </div>
  );
}

function GroupedActiveTaskCard({
  title,
  instances,
}: {
  title: string;
  instances: TaskWithCub[];
}) {
  const sample = instances[0]!;

  return (
    <Card className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
            {instances.length} Cubs
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {formatTaskCategory(sample.category, {
            subcategory: sample.subcategory,
            growthCategory: sample.growthCategory,
          })}{" "}
          · {formatProofType(sample.proofType)}
        </p>
      </div>

      <ul className="space-y-3">
        {instances.map((task) => (
          <li
            key={task.id}
            className={`rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 ${cubAccentClassNames(task.cub?.id, { border: true })}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {task.cub ? (
                    <CubColorBadge
                      cubId={task.cub.id}
                      displayName={task.cub.displayName}
                    />
                  ) : (
                    <span className="text-zinc-500">Unassigned</span>
                  )}
                  <StatusBadge status={task.status} />
                  <TaskScheduleBadge task={task} />
                </div>
                <TaskScheduleDisplay task={task} compact className="mt-1" />
              </div>
              <TaskInstanceActions task={task} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TaskInstanceActions({ task }: { task: TaskWithCub }) {
  const primaryHref =
    task.status === "SUBMITTED"
      ? `/dashboard/tasks/review/${task.id}`
      : task.cub
        ? `/dashboard/cubs/${task.cub.id}/tasks`
        : `/dashboard/tasks/${task.id}`;

  const primaryLabel =
    task.status === "SUBMITTED"
      ? "Review"
      : task.status === "IN_PROGRESS"
        ? "Submit"
        : task.status === "CLAIMED" || task.status === "SENT_BACK"
          ? "View instructions"
          : "View";

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link href={primaryHref} className="sm:min-w-28">
        <Button fullWidth size="lg">
          {primaryLabel}
        </Button>
      </Link>
      {isTaskEditable(task.status) ? (
        <Link href={`/dashboard/tasks/${task.id}/edit`}>
          <Button variant="secondary" size="lg">
            Edit
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
