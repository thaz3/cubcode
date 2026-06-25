import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { cubSectionLabel, cubSectionTitle } from "@/lib/cub-theme";
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
          <h2 className={cubSectionTitle}>Today&apos;s routines</h2>
          <p className="text-sm text-cub-muted">
            {routines.length === 0
              ? "No routines due today"
              : `${routines.length} routine${routines.length === 1 ? "" : "s"} to keep up with`}
          </p>
        </div>
        {routines.length > 0 ? (
          <Link
            href={`/cub/${cubId}/challenges`}
            className="shrink-0 text-sm font-medium text-cub-gold hover:text-cub-gold-light"
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
                  variant="constructive"
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-cub-off-white">{routine.title}</p>
                    <p className="text-sm text-cub-green-light/80">
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
                    <span className="rounded-full bg-cub-charcoal px-2.5 py-1 text-xs font-medium text-cub-muted ring-1 ring-cub-off-white/10">
                      Not started
                    </span>
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
