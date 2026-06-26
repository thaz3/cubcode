import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { CubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { TRAINING_DECK_STATUS_LABELS } from "@/lib/training-board-progress";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<
  CubTrainingBoardSummary["milestones"][number]["status"],
  string
> = {
  LOCKED: "bg-zinc-800 text-zinc-400",
  UNLOCKED: "bg-cub-gold-muted text-cub-gold-light",
  IN_PROGRESS: "bg-sky-950 text-sky-200 ring-1 ring-sky-400/30",
  COMPLETE: "bg-cub-green-muted text-cub-green-light",
};

type CubTrainingProgressCardProps = {
  cubId: string;
  summary: CubTrainingBoardSummary;
  className?: string;
};

export function CubTrainingProgressCard({
  cubId,
  summary,
  className,
}: CubTrainingProgressCardProps) {
  const overallPct =
    summary.totalCards > 0
      ? Math.round((summary.totalCardsApproved / summary.totalCards) * 100)
      : 0;

  return (
    <Card variant="accent" className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-cub-off-white">Training Board</h2>
          <p className="mt-1 text-sm text-cub-muted">
            {summary.completedDecks}/{summary.totalDecks} milestone
            {summary.totalDecks === 1 ? "" : "s"} complete ·{" "}
            {summary.totalCardsApproved}/{summary.totalCards} cards approved
          </p>
        </div>
        <Link
          href={`/cub/${cubId}/training`}
          className="text-sm font-medium text-cub-gold-light hover:underline"
        >
          Open board →
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-cub-muted">
          <span>Overall training progress</span>
          <span>{overallPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cub-charcoal">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cub-gold to-cub-gold-warm transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {summary.activeMilestone ? (
        <p className="text-sm text-cub-muted">
          Up next:{" "}
          <span className="font-medium text-cub-off-white">
            {summary.activeMilestone.title}
          </span>{" "}
          ({summary.activeMilestone.approvedCount}/{summary.activeMilestone.totalCards}{" "}
          cards)
        </p>
      ) : summary.completedDecks === summary.totalDecks && summary.totalDecks > 0 ? (
        <p className="text-sm text-cub-green-light">
          You finished every milestone on the Training Board!
        </p>
      ) : null}

      <ul className="space-y-3">
        {summary.milestones.map((milestone) => {
          const progressPct =
            milestone.totalCards > 0
              ? Math.round((milestone.approvedCount / milestone.totalCards) * 100)
              : 0;

          return (
            <li key={milestone.slug}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link
                  href={`/cub/${cubId}/training/deck/${milestone.slug}`}
                  className={cn(
                    "font-medium hover:underline",
                    milestone.status === "LOCKED"
                      ? "text-zinc-500"
                      : "text-cub-off-white",
                  )}
                >
                  Milestone {milestone.milestoneNumber}: {milestone.title}
                </Link>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_BADGE[milestone.status],
                  )}
                >
                  {TRAINING_DECK_STATUS_LABELS[milestone.status]}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cub-charcoal">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      milestone.status === "COMPLETE"
                        ? "bg-cub-green-bright"
                        : milestone.status === "LOCKED"
                          ? "bg-zinc-700"
                          : "bg-cub-gold",
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs text-cub-muted">
                  {milestone.approvedCount}/{milestone.totalCards}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
