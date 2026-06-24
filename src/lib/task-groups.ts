import type { Cub, Task } from "@/generated/prisma/client";

export type TaskWithCub = Task & { cub: Cub | null };

export type ActiveTaskListItem =
  | { type: "single"; task: TaskWithCub }
  | { type: "group"; key: string; title: string; instances: TaskWithCub[] };

/** Groups assigned tasks that share the same template or chore definition. */
export function getTaskGroupKey(task: Task): string {
  if (task.templateId) {
    return `template:${task.templateId}`;
  }

  return [
    "def",
    task.title.trim().toLowerCase(),
    task.category,
    task.subcategory ?? "",
    task.growthCategory ?? "",
    task.proofType,
  ].join("|");
}

export function groupActiveTasks(tasks: TaskWithCub[]): ActiveTaskListItem[] {
  const buckets = new Map<string, TaskWithCub[]>();

  for (const task of tasks) {
    const key = getTaskGroupKey(task);
    const list = buckets.get(key) ?? [];
    list.push(task);
    buckets.set(key, list);
  }

  const items: ActiveTaskListItem[] = [];

  for (const [key, instances] of buckets) {
    const sorted = [...instances].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );

    if (sorted.length === 1) {
      items.push({ type: "single", task: sorted[0]! });
    } else {
      items.push({
        type: "group",
        key,
        title: sorted[0]!.title,
        instances: sorted.sort((a, b) =>
          (a.cub?.displayName ?? "").localeCompare(b.cub?.displayName ?? ""),
        ),
      });
    }
  }

  return items.sort((a, b) => {
    const aTime =
      a.type === "single"
        ? a.task.updatedAt.getTime()
        : Math.max(...a.instances.map((t) => t.updatedAt.getTime()));
    const bTime =
      b.type === "single"
        ? b.task.updatedAt.getTime()
        : Math.max(...b.instances.map((t) => t.updatedAt.getTime()));
    return bTime - aTime;
  });
}
