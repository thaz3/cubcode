import Link from "next/link";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { CubLink } from "@/components/cub-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatProofType } from "@/lib/task-labels";
import { cubLink } from "@/lib/cub-theme";
import type { GroupedAssignmentRoutine } from "@/lib/assignment-routine-groups";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  ACTIVE: "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green-bright/35",
  PAUSED: "bg-cub-charcoal text-cub-muted ring-1 ring-cub-off-white/10",
  MIXED: "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/35",
} as const;

const STATUS_LABELS = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  MIXED: "Mixed",
} as const;

type AssignmentRoutineCardProps = {
  routine: GroupedAssignmentRoutine;
};

export function AssignmentRoutineCard({ routine }: AssignmentRoutineCardProps) {
  const primaryId = routine.assignments[0]?.id;
  const detailHref = primaryId ? `/dashboard/challenges/${primaryId}` : "#";
  const editHref = primaryId ? `/dashboard/challenges/${primaryId}/edit` : "#";
  const cardVariant =
    routine.status === "ACTIVE"
      ? "constructive"
      : routine.status === "PAUSED"
        ? "default"
        : "accent";

  return (
    <Card variant={cardVariant} className="space-y-3 !p-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <EarnTypeBadge earnType="routine" />
          <h2 className="text-base font-semibold text-cub-off-white">
            {routine.title}
          </h2>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              STATUS_STYLES[routine.status],
            )}
          >
            {STATUS_LABELS[routine.status]}
          </span>
        </div>

        <p className="text-sm text-cub-muted">
          {routine.assignments.map((assignment, index) => (
            <span key={assignment.id}>
              {index > 0 ? (
                <span className="text-cub-charcoal dark:text-zinc-600"> · </span>
              ) : null}
              <CubLink
                cubId={assignment.cub.id}
                displayName={assignment.cub.displayName}
                className={cubLink}
              />
            </span>
          ))}{" "}
          ·{" "}
          {formatChallengeInterval(
            routine.intervalType,
            routine.intervalConfig,
          )}{" "}
          · {formatProofType(routine.proofType)}
        </p>

        <p className="text-xs text-cub-muted">
          {routine.assignments.length} Cub
          {routine.assignments.length === 1 ? "" : "s"} assigned
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={detailHref} className="flex-1">
          <Button variant="constructive" fullWidth size="md">
            View routine
          </Button>
        </Link>
        <Link href={editHref} className="flex-1">
          <Button variant="neutral" fullWidth size="md">
            Edit
          </Button>
        </Link>
      </div>
    </Card>
  );
}
