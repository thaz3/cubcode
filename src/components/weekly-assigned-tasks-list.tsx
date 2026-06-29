import Link from "next/link";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { getTaskScheduleSummary } from "@/lib/task-schedule";
import type { WeekAssignedTask } from "@/lib/weekly-progress";
import { cn } from "@/lib/utils";

type WeeklyAssignedTasksListProps = {
  cubName: string;
  tasks: WeekAssignedTask[];
};

export function WeeklyAssignedTasksList({
  cubName,
  tasks,
}: WeeklyAssignedTasksListProps) {
  const label = `${cubName}'s assigned tasks this week`;

  return (
    <CollapsibleSection
      title={label}
      badge={tasks.length}
      defaultOpen={tasks.length > 0}
      summary={
        tasks.length === 0
          ? "Nothing assigned yet"
          : `${tasks.length} waiting to be completed`
      }
    >
      {tasks.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-zinc-500">
          No tasks assigned for this week.
        </p>
      ) : (
        <ul className="space-y-2 px-2 pb-2">
          {tasks.map((task) => (
            <AssignedTaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </CollapsibleSection>
  );
}

function AssignedTaskRow({ task }: { task: WeekAssignedTask }) {
  const schedule = getTaskScheduleSummary(task);

  return (
    <li>
      <Link
        href={`/dashboard/tasks/${task.id}`}
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 px-3 py-2.5 transition hover:border-cub-gold/25 hover:bg-cub-charcoal/80"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-cub-off-white">{task.title}</span>
            <StatusBadge status={task.status} />
            {task.isUrgent ? <TaskUrgentBadge /> : null}
          </div>
          {schedule.timingLabel ? (
            <p
              className={cn(
                "mt-1 text-xs",
                schedule.timingTone === "overdue" && "text-cub-red-light",
                schedule.timingTone === "due-today" && "text-cub-gold-light",
                schedule.timingTone === "left" && "text-cub-muted",
                !schedule.timingTone && "text-cub-muted",
              )}
            >
              {schedule.timingLabel}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs font-medium text-cub-gold">View →</span>
      </Link>
    </li>
  );
}
