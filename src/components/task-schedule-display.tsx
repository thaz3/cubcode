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
  overdue: "font-medium text-cub-red-light",
  "due-today": "font-medium text-cub-gold-light",
  left: "font-medium text-cub-green-light",
} as const;

export function TaskScheduleDisplay({
  task,
  className,
  compact = false,
}: TaskScheduleDisplayProps) {
  const schedule = getTaskScheduleSummary(task);

  return (
    <div className={cn("space-y-0.5 text-xs text-cub-muted", className)}>
      <p>Assigned {formatScheduleDate(schedule.assignedAt)}</p>
      <p>
        Due{" "}
        {schedule.dueLabel ? (
          <span className="font-medium text-cub-off-white">{schedule.dueLabel}</span>
        ) : (
          <span className="italic text-cub-muted">Not set — edit task to add</span>
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
          "bg-cub-red-muted text-cub-off-white ring-1 ring-cub-red/40",
        schedule.timingTone === "due-today" &&
          "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/35",
        schedule.timingTone === "left" &&
          "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green/35",
      )}
    >
      {schedule.timingTone === "overdue" ? "Urgent · " : null}
      {schedule.timingLabel}
    </span>
  );
}
