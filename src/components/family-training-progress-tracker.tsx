import Link from "next/link";
import { CubColorBadge } from "@/components/cub-color-dot";
import { Card } from "@/components/ui/card";
import type { FamilyCubTrainingProgress } from "@/lib/cub-training-board-summary";
import { TRAINING_DECK_STATUS_LABELS } from "@/lib/training-board-progress";
import { cn } from "@/lib/utils";

type FamilyTrainingProgressTrackerProps = {
  summaries: FamilyCubTrainingProgress[];
  selectedCubId?: string | null;
};

export function FamilyTrainingProgressTracker({
  summaries,
  selectedCubId,
}: FamilyTrainingProgressTrackerProps) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-semibold text-cub-off-white">
          Training path progress
        </h2>
        <p className="mt-1 text-sm text-cub-muted">
          Where each Cub is on the Code path. Select one to see their milestone
          list below.
        </p>
      </div>

      <ul className="space-y-3">
        {summaries.map((summary) => {
          const overallPct =
            summary.totalCards > 0
              ? Math.round((summary.totalCardsApproved / summary.totalCards) * 100)
              : 0;
          const isSelected = summary.cubId === selectedCubId;
          const pathLabel = summary.activeMilestone
            ? `Milestone ${summary.activeMilestone.milestoneNumber}: ${summary.activeMilestone.title}`
            : summary.completedDecks === summary.totalDecks && summary.totalDecks > 0
              ? "All milestones complete"
              : "Not started yet";

          return (
            <li key={summary.cubId}>
              <Link
                href={`/dashboard/tasks/templates?cubId=${summary.cubId}`}
                className={cn(
                  "block rounded-xl border p-4 transition",
                  isSelected
                    ? "border-cub-gold/50 bg-cub-gold-muted/30 ring-1 ring-cub-gold/30"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-cub-gold/30",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CubColorBadge
                    cubId={summary.cubId}
                    displayName={summary.displayName}
                  />
                  <p className="text-sm font-medium text-cub-gold">
                    {summary.completedDecks}/{summary.totalDecks} milestones ·{" "}
                    {summary.totalCardsApproved}/{summary.totalCards} cards
                  </p>
                </div>

                <p className="mt-2 text-sm text-cub-muted">
                  Current step:{" "}
                  <span className="font-medium text-cub-off-white">{pathLabel}</span>
                  {summary.activeMilestone ? (
                    <>
                      {" "}
                      ·{" "}
                      <span className="text-cub-gold-light">
                        {TRAINING_DECK_STATUS_LABELS[summary.activeMilestone.status]}
                      </span>
                    </>
                  ) : null}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cub-gold to-cub-gold-warm transition-all"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-cub-muted">{overallPct}%</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
