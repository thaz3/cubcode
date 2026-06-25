import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import type { ChallengeIntervalType, ChallengeProgressStatus } from "@/generated/prisma/client";

export type CubRoutinePreview = {
  id: string;
  title: string;
  intervalType: ChallengeIntervalType;
  intervalConfig: unknown;
  logStatus: ChallengeProgressStatus | null;
  intervalLabel: string | null;
};

type CubRoutinesSectionProps = {
  cubId: string;
  routines: CubRoutinePreview[];
};

export function CubRoutinesSection({ cubId, routines }: CubRoutinesSectionProps) {
  const preview = routines.slice(0, 5);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Today&apos;s routines</h2>
          <p className="text-sm text-zinc-500">
            {routines.length === 0
              ? "No routines due today"
              : `${routines.length} routine${routines.length === 1 ? "" : "s"} to keep up with`}
          </p>
        </div>
        {routines.length > 0 ? (
          <Link
            href={`/cub/${cubId}/challenges`}
            className="shrink-0 text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            All routines →
          </Link>
        ) : null}
      </div>

      {routines.length === 0 ? (
        <EmptyState
          title="No routines today"
          description="When your parent sets up a repeating routine, it will show here on the days it is due."
        />
      ) : (
        <ul className="space-y-2">
          {preview.map((routine) => (
            <li key={routine.id}>
              <Link href={`/cub/${cubId}/challenges/${routine.id}`}>
                <Card
                  variant="interactive"
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{routine.title}</p>
                    <p className="text-sm text-zinc-500">
                      {formatChallengeInterval(
                        routine.intervalType,
                        routine.intervalConfig,
                      )}
                      {routine.intervalLabel ? ` · ${routine.intervalLabel}` : ""}
                    </p>
                  </div>
                  {routine.logStatus ? (
                    <ChallengeProgressBadge status={routine.logStatus} />
                  ) : (
                    <span className="text-xs text-zinc-500">Not started</span>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
