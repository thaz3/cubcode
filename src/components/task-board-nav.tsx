import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TaskBoardSectionId } from "@/lib/task-board-sections";

type TaskBoardNavProps = {
  counts: Record<TaskBoardSectionId, number>;
  routinesCount?: number;
  libraryCount?: number;
};

const WORKFLOW_LINKS: Array<{ id: TaskBoardSectionId | "routines"; label: string }> = [
  { id: "assigned", label: "Assigned" },
  { id: "routines", label: "Routines" },
  { id: "active", label: "Active Tasks" },
  { id: "in-review", label: "In review" },
  { id: "completed", label: "Completed" },
];

const MORE_LINKS = [{ href: "#ready-to-assign", label: "Library" }] as const;

const linkClass =
  "inline-flex min-h-10 shrink-0 items-center rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-amber-700 hover:bg-amber-950/30";

export function TaskBoardNav({
  counts,
  routinesCount = 0,
  libraryCount = 0,
}: TaskBoardNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {WORKFLOW_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.id === "routines" ? "#routines" : `#${link.id}`}
          className={cn(linkClass, "gap-2")}
        >
          {link.label}
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {link.id === "routines" ? routinesCount : counts[link.id]}
          </span>
        </a>
      ))}
      {MORE_LINKS.map((link) => (
        <a key={link.href} href={link.href} className={cn(linkClass, "gap-2")}>
          {link.label}
          {link.href === "#ready-to-assign" ? (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {libraryCount}
            </span>
          ) : null}
        </a>
      ))}
      <Link
        href="/dashboard/tasks/templates"
        className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-violet-800/60 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-300 transition hover:border-violet-700"
      >
        Training Path →
      </Link>
    </nav>
  );
}
