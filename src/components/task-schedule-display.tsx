import {
  formatScheduleDate,
  getTaskScheduleSummary,
  type TaskScheduleInput,
} from "@/lib/task-schedule";
import { cn } from "@/lib/utils";

type TaskScheduleDisplayProps = {
  task: TaskScheduleInput;
  className?: string;
  compact?: boolean;
};

const TIMING_STYLES = {
  overdue: "font-medium text-red-700 dark:text-red-400",
  "due-today": "font-medium text-amber-700 dark:text-amber-400",
  left: "font-medium text-emerald-700 dark:text-emerald-400",
} as const;

export function TaskScheduleDisplay({
  task,
  className,
  compact = false,
}: TaskScheduleDisplayProps) {
  const schedule = getTaskScheduleSummary(task);

  return (
    <div className={cn("space-y-0.5 text-xs text-zinc-500", className)}>
      <p>Assigned {formatScheduleDate(schedule.assignedAt)}</p>
      <p>
        Due{" "}
        {schedule.dueLabel ? (
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {schedule.dueLabel}
          </span>
        ) : (
          <span className="italic text-zinc-400">Not set — edit task to add</span>
        )}
      </p>
      {schedule.timingLabel && schedule.timingTone ? (
        <p
          className={cn(
            TIMING_STYLES[schedule.timingTone],
            compact ? "text-xs" : "text-sm",
          )}
        >
          {schedule.timingTone === "overdue" ? "Urgent · " : null}
          {schedule.timingLabel}
        </p>
      ) : null}
    </div>
  );
}

export function TaskScheduleBadge({ task }: { task: TaskScheduleInput }) {
  const schedule = getTaskScheduleSummary(task);

  if (!schedule.timingLabel || !schedule.timingTone) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        schedule.timingTone === "overdue" &&
          "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        schedule.timingTone === "due-today" &&
          "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
        schedule.timingTone === "left" &&
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      )}
    >
      {schedule.timingTone === "overdue" ? "Urgent · " : null}
      {schedule.timingLabel}
    </span>
  );
}
