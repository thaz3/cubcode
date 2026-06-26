import { CubColorBadge } from "@/components/cub-color-dot";
import { Card } from "@/components/ui/card";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import { TRAINING_DECK_STATUS_LABELS } from "@/lib/training-board-progress";
import { cn } from "@/lib/utils";

export type CubDeckProgress = {
  cubId: string;
  displayName: string;
  status: TrainingDeckBoardStatus;
  approvedCount: number;
  totalCards: number;
};

type TrainingDeckMilestoneProgressProps = {
  milestoneNumber: number;
  cubProgress: CubDeckProgress[];
  subtitle?: string;
};

export function TrainingDeckMilestoneProgress({
  milestoneNumber,
  cubProgress,
  subtitle = "Progress for each Cub on this deck",
}: TrainingDeckMilestoneProgressProps) {
  const anyInProgress = cubProgress.some((c) => c.status === "IN_PROGRESS");
  const allComplete =
    cubProgress.length > 0 && cubProgress.every((c) => c.status === "COMPLETE");
  const allLocked =
    cubProgress.length > 0 && cubProgress.every((c) => c.status === "LOCKED");

  return (
    <Card
      className={cn(
        "space-y-4 border p-5",
        allComplete
          ? "border-cub-green-bright/40 cub-card-green"
          : anyInProgress
            ? "border-sky-400/40 bg-sky-950/20"
            : allLocked
              ? "border-zinc-700 bg-zinc-900/40"
              : "border-cub-gold/40 cub-card-gold",
      )}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
          Milestone {milestoneNumber}
        </p>
        <p className="mt-1 text-sm text-cub-muted">{subtitle}</p>
      </div>

      <ul className="space-y-3">
        {cubProgress.map((cub) => {
          const progressPct =
            cub.totalCards > 0
              ? Math.round((cub.approvedCount / cub.totalCards) * 100)
              : 0;

          return (
            <li
              key={cub.cubId}
              className="space-y-2 rounded-lg border border-zinc-800/80 bg-zinc-950/30 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CubColorBadge cubId={cub.cubId} displayName={cub.displayName} />
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-cub-gold">
                    {cub.approvedCount}/{cub.totalCards} cards complete
                  </span>
                  <span className="text-cub-muted">
                    · {TRAINING_DECK_STATUS_LABELS[cub.status]}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    cub.status === "COMPLETE" ? "bg-cub-green-bright" : "bg-cub-gold",
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
