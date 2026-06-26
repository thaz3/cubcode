"use client";

import Link from "next/link";
import type { ChallengeIntervalType, Prisma, TaskProofType } from "@/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { CubLink } from "@/components/cub-link";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatChallengeSummary } from "@/lib/challenge-labels";

export type AssignmentRoutine = {
  id: string;
  title: string;
  status: string;
  intervalType: ChallengeIntervalType;
  intervalConfig: Prisma.JsonValue;
  proofType: TaskProofType;
  cub: { id: string; displayName: string };
};

type AssignmentsRoutinesSectionProps = {
  routines: AssignmentRoutine[];
};

export function AssignmentsRoutinesSection({
  routines,
}: AssignmentsRoutinesSectionProps) {
  return (
    <section id="routines" className="scroll-mt-36 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Routines</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Repeating habits assigned to a Cub — part of your household
            assignments, separate from themed training packs.
          </p>
        </div>
        <Link
          href="/dashboard/tasks?kind=challenge#create"
          className="text-sm font-medium text-cub-gold hover:text-cub-gold-light"
        >
          New routine →
        </Link>
      </div>

      {routines.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">
            No routines yet. Create one from the button above.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {routines.map((routine) => (
            <li key={routine.id}>
              <Link href={`/dashboard/challenges/${routine.id}`}>
                <Card variant="interactive" className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-50">
                      {routine.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        routine.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {routine.status === "ACTIVE" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <CubLink
                      cubId={routine.cub.id}
                      displayName={routine.cub.displayName}
                      linked={false}
                      className="text-cub-gold"
                    />{" "}
                    · {formatChallengeInterval(routine.intervalType, routine.intervalConfig)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatChallengeSummary(routine)}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
