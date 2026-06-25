import Link from "next/link";
import { RequestSessionTimer } from "@/components/request-session-timer";
import { Card } from "@/components/ui/card";
import { cubFocusBanner } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

export type ActiveFocusTask = {
  id: string;
  title: string;
  focusSessionStartedAt: string;
};

type ActiveFocusTimersBannerProps = {
  cubName: string;
  tasks: ActiveFocusTask[];
};

export function ActiveFocusTimersBanner({
  cubName,
  tasks,
}: ActiveFocusTimersBannerProps) {
  if (tasks.length === 0) {
    return null;
  }

  const singleTask = tasks.length === 1;

  return (
    <Card variant="constructive" className={cn(cubFocusBanner)}>
      <p className="text-sm font-medium text-cub-green-light">
        {cubName} opened instructions for{" "}
        {singleTask ? "a task" : `${tasks.length} tasks`}
      </p>

      <ul className={singleTask ? "mt-4" : "mt-4 space-y-3"}>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={
              singleTask
                ? "flex flex-wrap items-center justify-between gap-4"
                : "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cub-green/25 bg-cub-ebony/50 px-3 py-3"
            }
          >
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className={
                singleTask
                  ? "text-lg font-semibold text-cub-off-white hover:underline"
                  : "font-medium text-cub-off-white hover:underline"
              }
            >
              {task.title}
            </Link>
            <RequestSessionTimer
              startedAt={task.focusSessionStartedAt}
              label="Request timer running"
              large={singleTask}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
