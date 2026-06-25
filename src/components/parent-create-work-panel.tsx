"use client";

import { useState } from "react";
import type { Cub } from "@/generated/prisma/client";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { ChallengeForm } from "@/components/challenge-form";
import { TaskChallengeExplainer } from "@/components/task-challenge-explainer";
import { cn } from "@/lib/utils";

export type ParentCreateKind = "task" | "challenge";

type ParentCreateWorkPanelProps = {
  cubs: Cub[];
  defaultKind?: ParentCreateKind;
  defaultCubId?: string;
  showExplainer?: boolean;
  compact?: boolean;
};

const KIND_OPTIONS: Array<{ value: ParentCreateKind; label: string; hint: string }> =
  [
    { value: "task", label: "Task", hint: "One time" },
    { value: "challenge", label: "Routine", hint: "Repeats" },
  ];

export function ParentCreateWorkPanel({
  cubs,
  defaultKind = "task",
  defaultCubId,
  showExplainer = true,
  compact = false,
}: ParentCreateWorkPanelProps) {
  const [kind, setKind] = useState<ParentCreateKind>(defaultKind);
  const cubName = defaultCubId
    ? cubs.find((c) => c.id === defaultCubId)?.displayName
    : undefined;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {showExplainer ? <TaskChallengeExplainer /> : null}

      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Create a task or routine"
          className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1"
        >
          {KIND_OPTIONS.map((option) => {
            const selected = kind === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setKind(option.value)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-left transition-colors",
                  selected
                    ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs opacity-80">{option.hint}</span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {kind === "task" ? (
            <CreateOneOffTaskForm
              cubId={defaultCubId}
              cubName={cubName}
              compact={compact}
            />
          ) : cubs.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Add a Cub profile before creating a repeating routine.
            </p>
          ) : (
            <ChallengeForm
              cubs={cubs}
              defaultCubId={defaultCubId}
              submitLabel={
                defaultCubId
                  ? `Create routine for ${cubName ?? "Cub"}`
                  : "Create routine"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
