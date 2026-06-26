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
  variant?: "default" | "compact";
};

const PREVIEW_LIMIT = 5;
const COMPACT_PREVIEW_LIMIT = 3;

export function CubAssignedTasksSection({
  cubId,
  tasks,
  variant = "default",
}: CubAssignedTasksSectionProps) {
  const isCompact = variant === "compact";
  const previewLimit = isCompact ? COMPACT_PREVIEW_LIMIT : PREVIEW_LIMIT;
  const preview = tasks.slice(0, previewLimit);
  const remaining = tasks.length - preview.length;

  const content =
    tasks.length === 0 ? (
      isCompact ? (
        <p className="text-xs text-cub-muted">Nothing on your list yet.</p>
      ) : (
        <EmptyState
          title="No tasks yet"
          description="When your parent assigns something, it will show up here."
        />
      )
    ) : (
      <>
        <ul className={isCompact ? "space-y-1.5" : "space-y-2"}>
          {preview.map((task) => (
            <li key={task.id}>
              <Link href={`/cub/${cubId}/challenges#assignments`}>
                <Card
                  variant="interactive"
                  className={
                    isCompact
                      ? "px-3 py-2"
                      : "flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  }
                >
                  <div className="min-w-0">
                    <p
                      className={
                        isCompact
                          ? "truncate text-sm font-medium text-zinc-100"
                          : "truncate font-medium text-zinc-100"
                      }
                    >
                      {task.title}
                    </p>
                    {!isCompact ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.status} />
                        <TaskScheduleBadge task={task} />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <StatusBadge status={task.status} />
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        {remaining > 0 && !isCompact ? (
          <Link
            href={`/cub/${cubId}/challenges#assignments`}
            className="block text-center text-sm font-medium text-zinc-400 hover:text-zinc-200"
          >
            + {remaining} more task{remaining === 1 ? "" : "s"}
          </Link>
        ) : null}
      </>
    );

  if (isCompact) {
    return (
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100">Assigned to you</h2>
            <p className="mt-0.5 text-xs text-cub-muted">
              {tasks.length === 0
                ? "No tasks"
                : `${tasks.length} on your list`}
            </p>
          </div>
          {tasks.length > 0 ? (
            <Link
              href={`/cub/${cubId}/challenges#assignments`}
              className="shrink-0 text-xs font-medium text-cub-gold hover:text-cub-gold-light"
            >
              All →
            </Link>
          ) : null}
        </div>
        <div className="flex-1">{content}</div>
        {remaining > 0 ? (
          <Link
            href={`/cub/${cubId}/challenges#assignments`}
            className="text-center text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            + {remaining} more
          </Link>
        ) : null}
      </Card>
    );
  }

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
            href={`/cub/${cubId}/challenges#assignments`}
            className="shrink-0 text-sm font-medium text-cub-gold hover:text-cub-gold-light"
          >
            All tasks →
          </Link>
        ) : null}
      </div>

      {content}
    </section>
  );
}
