"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatChallengeSummary } from "@/lib/challenge-labels";
import type { AssignmentRoutine } from "@/lib/assignment-routine-groups";
import { groupAssignmentRoutines } from "@/lib/assignment-routine-groups";
import { cn } from "@/lib/utils";

type AssignmentsRoutinesSectionProps = {
  routines: AssignmentRoutine[];
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-950 text-emerald-300",
  PAUSED: "bg-zinc-800 text-zinc-400",
  MIXED: "bg-amber-950 text-amber-200",
} as const;

const STATUS_LABELS = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  MIXED: "Mixed",
} as const;

export function AssignmentsRoutinesSection({
  routines,
}: AssignmentsRoutinesSectionProps) {
  const groupedRoutines = groupAssignmentRoutines(routines);

  return (
    <section id="routines" className="scroll-mt-36 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Routines</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Repeating habits assigned to your Cubs — grouped when the same routine
            is shared across kids.
          </p>
        </div>
        <Link
          href="/dashboard/tasks?kind=challenge#create"
          className="text-sm font-medium text-cub-gold hover:text-cub-gold-light"
        >
          New routine →
        </Link>
      </div>

      {groupedRoutines.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">
            No routines yet. Create one from the button above.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {groupedRoutines.map((routine) => (
            <li key={routine.key}>
              <Card className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-50">
                      {routine.title}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        STATUS_STYLES[routine.status],
                      )}
                    >
                      {STATUS_LABELS[routine.status]}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/challenges/${routine.assignments[0]?.id}/edit`}
                    className="text-sm font-medium text-cub-gold hover:text-cub-gold-light"
                  >
                    Edit routine →
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Assigned to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {routine.assignments.map((assignment) => (
                      <Link
                        key={assignment.id}
                        href={`/dashboard/challenges/${assignment.id}`}
                        className="rounded-full transition hover:ring-2 hover:ring-cub-gold/30"
                      >
                        <CubColorBadge
                          cubId={assignment.cub.id}
                          displayName={assignment.cub.displayName}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-zinc-400">
                  {formatChallengeInterval(routine.intervalType, routine.intervalConfig)}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatChallengeSummary(routine)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
