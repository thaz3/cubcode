import { EarnTypeBadge } from "@/components/earn-type-badge";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CubRoutinePreview } from "@/components/cub-routines-section";
import { cubSectionTitle } from "@/lib/cub-theme";
import { getTaskEarnType } from "@/lib/earn-types";
import type { TaskScheduleInput } from "@/lib/task-schedule";
import { sortTasksByUrgency } from "@/lib/task-schedule";

type TodayTask = TaskScheduleInput & {
  id: string;
  title: string;
  focusActivityCardId?: string | null;
  trainingDeckId?: string | null;
};

type WorkForTodayItem =
  | { kind: "routine"; id: string; title: string; href: string; earnType: "routine" }
  | {
      kind: "task";
      id: string;
      title: string;
      href: string;
      status: TodayTask["status"];
      earnType: "task" | "training_path";
    };

type CubWorkForTodaySectionProps = {
  cubId: string;
  routines: CubRoutinePreview[];
  tasks: TodayTask[];
  variant?: "default" | "compact";
};

function buildWorkForTodayItems(
  cubId: string,
  routines: CubRoutinePreview[],
  tasks: TodayTask[],
): WorkForTodayItem[] {
  const routineItems: WorkForTodayItem[] = routines.map((routine) => ({
    kind: "routine",
    id: routine.id,
    title: routine.title,
    href: `/cub/${cubId}/challenges/${routine.id}`,
    earnType: "routine",
  }));

  const taskItems: WorkForTodayItem[] = sortTasksByUrgency(tasks).map((task) => {
    const earnType = getTaskEarnType(task);
    return {
      kind: "task",
      id: task.id,
      title: task.title,
      href:
        earnType === "training_path"
          ? `/cub/${cubId}/training`
          : `/cub/${cubId}/challenges#assignments`,
      status: task.status,
      earnType,
    };
  });

  return [...routineItems, ...taskItems];
}

export function CubWorkForTodaySection({
  cubId,
  routines,
  tasks,
  variant = "default",
}: CubWorkForTodaySectionProps) {
  const isCompact = variant === "compact";
  const items = buildWorkForTodayItems(cubId, routines, tasks);
  const previewLimit = isCompact ? 4 : 6;
  const preview = items.slice(0, previewLimit);
  const remaining = items.length - preview.length;
  const homeHref = `/cub/${cubId}#den`;
  const routinesHref = `/cub/${cubId}/challenges`;

  const content =
    items.length === 0 ? (
      isCompact ? (
        <p className="text-xs text-cub-muted">Nothing due today.</p>
      ) : (
        <EmptyState
          title="Nothing due today"
          description="When your parent assigns tasks or routines for today, they will show up here."
        />
      )
    ) : (
      <>
        <ul className={isCompact ? "space-y-1.5" : "space-y-2"}>
          {preview.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link href={item.href}>
                <Card
                  variant={item.kind === "routine" ? "constructive" : "interactive"}
                  className={
                    isCompact
                      ? "px-3 py-2"
                      : "flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <EarnTypeBadge earnType={item.earnType} />
                      <p
                      className={
                        isCompact
                          ? "truncate text-sm font-medium text-cub-off-white"
                          : "font-medium text-cub-off-white"
                      }
                    >
                      {item.title}
                    </p>
                    </div>
                    {!isCompact ? (
                      <p className="mt-1 text-xs text-cub-muted">
                        {item.kind === "routine" ? "Due today" : "Assigned work"}
                      </p>
                    ) : null}
                  </div>
                  {item.kind === "task" ? (
                    <StatusBadge status={item.status} />
                  ) : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
        {remaining > 0 && !isCompact ? (
          <p className="text-center text-sm text-cub-muted">
            + {remaining} more for today
          </p>
        ) : null}
      </>
    );

  if (isCompact) {
    return (
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-cub-off-white">Work for Today</h2>
            <p className="mt-0.5 text-xs text-cub-muted">
              {items.length === 0
                ? "Nothing due"
                : `${items.length} item${items.length === 1 ? "" : "s"} due today`}
            </p>
          </div>
          {items.length > 0 ? (
            <Link
              href={homeHref}
              className="shrink-0 text-xs font-medium text-cub-gold hover:text-cub-gold-light"
            >
              Calendar →
            </Link>
          ) : null}
        </div>
        <div className="flex-1">{content}</div>
        {remaining > 0 ? (
          <div className="flex justify-center gap-3 text-xs font-medium">
            <Link href={homeHref} className="text-cub-muted hover:text-cub-off-white">
              Calendar
            </Link>
            <Link href={routinesHref} className="text-cub-muted hover:text-cub-off-white">
              Routines
            </Link>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className={cubSectionTitle}>Work for Today</h2>
          <p className="text-sm text-cub-muted">
            {items.length === 0
              ? "No tasks or routines due today"
              : `${items.length} item${items.length === 1 ? "" : "s"} — tasks and routines for today`}
          </p>
        </div>
        {items.length > 0 ? (
          <div className="flex shrink-0 gap-3 text-sm font-medium">
            <Link href={homeHref} className="text-cub-gold hover:text-cub-gold-light">
              Calendar →
            </Link>
            <Link href={routinesHref} className="text-cub-gold hover:text-cub-gold-light">
              Routines →
            </Link>
          </div>
        ) : null}
      </div>
      {content}
    </section>
  );
}
