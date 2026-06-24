import Link from "next/link";
import { CubColorBadge } from "@/components/cub-color-dot";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatTaskCategory } from "@/lib/task-categories";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatProofType } from "@/lib/task-labels";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import type { ActiveTaskListItem, TaskWithCub } from "@/lib/task-groups";
import { isTaskEditable } from "@/lib/task-transitions";

type ActiveTaskListProps = {
  items: ActiveTaskListItem[];
};

export function ActiveTaskList({ items }: ActiveTaskListProps) {
  return (
    <div className="mt-4 grid gap-3">
      {items.map((item) =>
        item.type === "group" ? (
          <GroupedActiveTaskCard
            key={item.key}
            title={item.title}
            instances={item.instances}
          />
        ) : (
          <SingleActiveTaskCard key={item.task.id} task={item.task} />
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
          <h3 className="font-medium">{title}</h3>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {instances.length} Cubs
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {formatTaskCategory(sample.category, {
            subcategory: sample.subcategory,
            growthCategory: sample.growthCategory,
          })}{" "}
          · {formatProofType(sample.proofType)}
        </p>
      </div>

      <ul className="space-y-2">
        {instances.map((task) => (
          <li
            key={task.id}
            className={`flex flex-col gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between ${cubAccentClassNames(task.cub?.id, { border: true })}`}
          >
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
                <TaskStatusBadge status={task.status} />
                <TaskScheduleBadge task={task} />
              </div>
              <TaskScheduleDisplay task={task} compact className="mt-1" />
            </div>
            <TaskInstanceActions task={task} compact />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SingleActiveTaskCard({ task }: { task: TaskWithCub }) {
  return (
    <Card
      className={`flex flex-wrap items-center justify-between gap-3 ${cubAccentClassNames(task.cub?.id, { border: true })}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/tasks/${task.id}`}
            className="font-medium hover:text-amber-700"
          >
            {task.title}
          </Link>
          <TaskStatusBadge status={task.status} />
          <TaskScheduleBadge task={task} />
        </div>
        <p className="text-sm text-zinc-500">
          {task.cub ? (
            <CubColorBadge
              cubId={task.cub.id}
              displayName={task.cub.displayName}
            />
          ) : (
            "Unassigned"
          )}
        </p>
        <TaskScheduleDisplay task={task} className="mt-1" />
      </div>
      <TaskInstanceActions task={task} />
    </Card>
  );
}

function TaskInstanceActions({
  task,
  compact = false,
}: {
  task: TaskWithCub;
  compact?: boolean;
}) {
  const compactClass = compact ? "px-3 py-1.5 text-xs" : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/tasks/${task.id}`}>
        <Button variant="secondary" className={compactClass}>
          View
        </Button>
      </Link>
      {isTaskEditable(task.status) ? (
        <Link href={`/dashboard/tasks/${task.id}/edit`}>
          <Button variant="secondary" className={compactClass}>
            Edit
          </Button>
        </Link>
      ) : null}
      {task.cub ? (
        <Link href={`/dashboard/cubs/${task.cub.id}/tasks`}>
          <Button variant="secondary" className={compactClass}>
            Open Cub tasks
          </Button>
        </Link>
      ) : null}
      {task.status === "SUBMITTED" ? (
        <Link href={`/dashboard/tasks/review/${task.id}`}>
          <Button className={compactClass}>Review</Button>
        </Link>
      ) : null}
    </div>
  );
}
