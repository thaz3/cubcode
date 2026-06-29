"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { TaskBoardSectionId } from "@/lib/task-board-sections";
import { cn } from "@/lib/utils";

type TaskBoardNavProps = {
  counts: Record<TaskBoardSectionId, number>;
  routinesCount?: number;
  libraryCount?: number;
};

const WORKFLOW_LINKS: Array<{
  sectionId: string;
  label: string;
  count: (props: TaskBoardNavProps) => number;
}> = [
  {
    sectionId: "library",
    label: "Library",
    count: (props) => props.libraryCount ?? 0,
  },
  {
    sectionId: "waiting-to-start",
    label: "Waiting to start",
    count: (props) => props.counts.assigned,
  },
  {
    sectionId: "routines",
    label: "Routines",
    count: (props) => props.routinesCount ?? 0,
  },
  {
    sectionId: "active",
    label: "In progress",
    count: (props) => props.counts.active,
  },
  {
    sectionId: "in-review",
    label: "In review",
    count: (props) => props.counts["in-review"],
  },
  {
    sectionId: "completed",
    label: "Completed",
    count: (props) => props.counts.completed,
  },
];

const linkClass =
  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition";

const linkInactive =
  "border-zinc-700 text-zinc-300 hover:border-amber-700 hover:bg-amber-950/30";

const linkActive =
  "border-cub-gold/60 bg-cub-gold-muted/50 text-cub-gold-light shadow-sm shadow-cub-gold/10";

function useBoardHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    function sync() {
      setHash(window.location.hash.replace(/^#/, ""));
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return hash;
}

export function TaskBoardNav({
  counts,
  routinesCount = 0,
  libraryCount = 0,
}: TaskBoardNavProps) {
  const navProps = { counts, routinesCount, libraryCount };
  const activeHash = useBoardHash();

  const jumpToSection = useCallback((sectionId: string) => {
    window.location.hash = sectionId;
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Assignment sections"
    >
      {WORKFLOW_LINKS.map((link) => {
        const isActive = activeHash === link.sectionId;

        return (
          <a
            key={link.sectionId}
            href={`#${link.sectionId}`}
            aria-current={isActive ? "true" : undefined}
            className={cn(linkClass, isActive ? linkActive : linkInactive)}
            onClick={(event) => {
              event.preventDefault();
              jumpToSection(link.sectionId);
            }}
          >
            {link.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isActive
                  ? "bg-cub-gold/20 text-cub-gold-light"
                  : "bg-zinc-800 text-zinc-400",
              )}
            >
              {link.count(navProps)}
            </span>
          </a>
        );
      })}
      <Link
        href="/dashboard/tasks/templates"
        className={cn(linkClass, linkInactive, "border-violet-800/60 bg-violet-950/30 text-violet-300 hover:border-violet-700")}
      >
        Training Path →
      </Link>
    </nav>
  );
}
