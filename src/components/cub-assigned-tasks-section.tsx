import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskScheduleBadge } from "@/components/task-schedule-display";
import type { TaskScheduleInput } from "@/lib/task-schedule";

type AssignedTask = TaskScheduleInput & {
  id: string;
  title: string;
};

type CubAssignedTasksSectionProps = {
  cubId: string;
  tasks: AssignedTask[];
};

const PREVIEW_LIMIT = 5;

export function CubAssignedTasksSection({
  cubId,
  tasks,
}: CubAssignedTasksSectionProps) {
  const preview = tasks.slice(0, PREVIEW_LIMIT);
  const remaining = tasks.length - preview.length;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Assigned to you</h2>
          <p className="text-sm text-zinc-500">
            {tasks.length === 0
              ? "Nothing on your list yet"
              : `${tasks.length} task${tasks.length === 1 ? "" : "s"} on your list`}
          </p>
        </div>
        {tasks.length > 0 ? (
          <Link
            href={`/cub/${cubId}/tasks`}
            className="shrink-0 text-sm font-medium text-cub-gold hover:text-cub-gold-light"
          >
            All tasks →
          </Link>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="When your parent assigns something, it will show up here."
        />
      ) : (
        <ul className="space-y-2">
          {preview.map((task) => (
            <li key={task.id}>
              <Link href={`/cub/${cubId}/tasks`}>
                <Card
                  variant="interactive"
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">{task.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={task.status} />
                      <TaskScheduleBadge task={task} />
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 ? (
        <Link
          href={`/cub/${cubId}/tasks`}
          className="block text-center text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          + {remaining} more task{remaining === 1 ? "" : "s"}
        </Link>
      ) : null}
    </section>
  );
}
