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
    <nav className="flex gap-2 overflow-x-auto pb-1 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-amber-700 hover:bg-amber-950/30",
          )}
        >
          {link.label}
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {counts[link.id]}
          </span>
        </a>
      ))}
      <Link
        href="/dashboard/tasks/templates"
        className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-violet-800/60 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-300 transition hover:border-violet-700"
      >
        Templates →
      </Link>
    </nav>
  );
}
