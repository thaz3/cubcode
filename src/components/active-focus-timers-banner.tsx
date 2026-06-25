import Link from "next/link";
import { RequestSessionTimer } from "@/components/request-session-timer";
import { Card } from "@/components/ui/card";

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
    <Card className="border-indigo-300 bg-indigo-50/90 dark:border-indigo-800 dark:bg-indigo-950/50">
      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
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
                : "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-white/70 px-3 py-3 dark:border-indigo-900 dark:bg-zinc-950/50"
            }
          >
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className={
                singleTask
                  ? "text-lg font-semibold text-indigo-950 hover:underline dark:text-indigo-50"
                  : "font-medium text-indigo-950 hover:underline dark:text-indigo-50"
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
