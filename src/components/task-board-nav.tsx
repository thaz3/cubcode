import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TaskBoardSectionId } from "@/lib/task-board-sections";

type TaskBoardNavProps = {
  counts: Record<TaskBoardSectionId, number>;
};

const LINKS: Array<{ id: TaskBoardSectionId; label: string }> = [
  { id: "assignment", label: "Created" },
  { id: "active", label: "Active" },
  { id: "in-review", label: "In review" },
  { id: "completed", label: "Completed" },
];

export function TaskBoardNav({ counts }: TaskBoardNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 pt-3">
      {LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-amber-800 dark:hover:bg-amber-950/30",
          )}
        >
          {link.label}
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {counts[link.id]}
          </span>
        </a>
      ))}
      <Link
        href="/dashboard/tasks/templates"
        className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1.5 text-sm font-medium text-violet-900 transition hover:border-violet-300 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200"
      >
        Template board →
      </Link>
    </nav>
  );
}
