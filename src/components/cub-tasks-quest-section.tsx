"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CubWorkflowTaskCard,
  type FocusGrowthContext,
} from "@/components/cub-workflow-task-card";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { EmptyState } from "@/components/ui/empty-state";
import { cubKidGameCard } from "@/lib/cub-kid-theme";
import type { Task } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type TaskWithFocusBlocks = Task & {
  focusBlocks: { durationMinutes: number }[];
};

type CubTasksQuestSectionProps = {
  cubId: string;
  tasks: TaskWithFocusBlocks[];
  focusGrowth: FocusGrowthContext;
};

function taskIdFromHash(hash: string): string | null {
  const match = hash.match(/^#mission-(.+)$/);
  return match?.[1] ?? null;
}

export function CubTasksQuestSection({
  cubId,
  tasks,
  focusGrowth,
}: CubTasksQuestSectionProps) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const selectedTaskId = useMemo(() => {
    const fromHash = taskIdFromHash(hash);
    if (fromHash && tasks.some((task) => task.id === fromHash)) {
      return fromHash;
    }
    return tasks[0]?.id ?? null;
  }, [hash, tasks]);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <section className="space-y-3">
      <CubKidSectionHeader
        title="Tasks"
        subtitle="One-time assignments from your parent."
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="When your parent assigns a task, it will show up here."
        />
      ) : (
        <>
          <CubKidPanel variant="gold" contentClassName="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
              📋 Active tasks
            </p>
            <ul className="space-y-2">
              {tasks.map((task) => {
                const isSelected = task.id === selectedTaskId;

                return (
                  <li key={task.id}>
                    <Link
                      href={`/cub/${cubId}/tasks/${task.id}`}
                      className={cn(
                        cubKidGameCard,
                        "block space-y-2 border-cub-gold/35 bg-gradient-to-br from-cub-gold/15 to-cub-charcoal p-4 transition",
                        isSelected && "ring-1 ring-cub-gold/50",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-cub-off-white">
                          {task.title}
                        </p>
                        <StatusBadge status={task.status} />
                      </div>
                      <TaskScheduleDisplay
                        task={task}
                        className="text-sm text-cub-muted"
                      />
                      <p className="text-xs font-bold uppercase text-cub-gold-light">
                        {isSelected ? "Selected · scroll below" : "View task →"}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CubKidPanel>

          {selectedTask ? (
            <div
              id={`mission-${selectedTask.id}`}
              className="scroll-mt-24"
            >
              <CubWorkflowTaskCard
                task={selectedTask}
                cubId={cubId}
                focusGrowth={
                  selectedTask.category === "FOCUS_BLOCK" ? focusGrowth : null
                }
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
