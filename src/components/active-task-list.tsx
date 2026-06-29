import { TaskCard } from "@/components/task-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import type { ActiveTaskListItem, TaskWithCub } from "@/lib/task-groups";

type ActiveTaskListProps = {
  items: ActiveTaskListItem[];
  layout?: "deck" | "list";
};

function flattenTasks(items: ActiveTaskListItem[]): TaskWithCub[] {
  return items.flatMap((item) =>
    item.type === "group" ? item.instances : [item.task],
  );
}

export function ActiveTaskList({ items, layout = "deck" }: ActiveTaskListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No tasks in this section.</p>;
  }

  if (layout === "list") {
    const tasks = flattenTasks(items);
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} board />
        ))}
      </div>
    );
  }

  const cards = items.map((item) =>
    item.type === "group" ? (
      <GroupedActiveTaskDeck key={item.key} instances={item.instances} />
    ) : (
      <TaskCard key={item.task.id} task={item.task} />
    ),
  );

  return <SwipeCardDeck emptyLabel="No tasks in this section.">{cards}</SwipeCardDeck>;
}

function GroupedActiveTaskDeck({
  instances,
}: {
  instances: TaskWithCub[];
}) {
  return (
    <div className="space-y-4">
      {instances.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
