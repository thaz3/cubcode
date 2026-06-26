import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { TRAINING_DECK_STATUS_LABELS } from "@/lib/training-board-progress";
import { cubSectionTitle } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

type CubTrainingSectionProps = {
  cubId: string;
  summary: CubTrainingBoardSummary;
  variant?: "default" | "compact";
};

export function CubTrainingSection({
  cubId,
  summary,
  variant = "default",
}: CubTrainingSectionProps) {
  const isCompact = variant === "compact";
  const trainingHref = `/cub/${cubId}/training`;
  const overallPct =
    summary.totalCards > 0
      ? Math.round((summary.totalCardsApproved / summary.totalCards) * 100)
      : 0;
  const active = summary.activeMilestone;
  const previewMilestones = summary.milestones.slice(0, isCompact ? 2 : 4);

  const content =
    summary.milestones.length === 0 ? (
      isCompact ? (
        <p className="text-xs text-cub-muted">Training path not ready yet.</p>
      ) : (
        <EmptyState
          title="Training Path coming soon"
          description="Your parent will set up your required lesson journey here."
        />
      )
    ) : (
      <ul className={isCompact ? "space-y-1.5" : "space-y-2"}>
        {previewMilestones.map((milestone) => {
          const progressPct =
            milestone.totalCards > 0
              ? Math.round((milestone.approvedCount / milestone.totalCards) * 100)
              : 0;

          return (
            <li key={milestone.slug}>
              <Link href={`${trainingHref}/deck/${milestone.slug}`}>
                <Card
                  variant="interactive"
                  className={isCompact ? "space-y-2 px-3 py-2" : "space-y-2 py-4"}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          isCompact
                            ? "truncate text-sm font-medium"
                            : "font-medium",
                          milestone.status === "LOCKED"
                            ? "text-zinc-500"
                            : "text-cub-off-white",
                        )}
                      >
                        {milestone.title}
                      </p>
                      {!isCompact ? (
                        <p className="mt-0.5 text-xs text-cub-muted">
                          Milestone {milestone.milestoneNumber}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-cub-muted">
                      {isCompact
                        ? milestone.status === "COMPLETE"
                          ? "Done"
                          : milestone.status === "LOCKED"
                            ? "Lock"
                            : `${milestone.approvedCount}/${milestone.totalCards}`
                        : TRAINING_DECK_STATUS_LABELS[milestone.status]}
                    </span>
                  </div>
                  {!isCompact ? (
                    <div className="h-1.5 overflow-hidden rounded-full bg-cub-charcoal">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          milestone.status === "COMPLETE"
                            ? "bg-cub-green-bright"
                            : "bg-cub-gold",
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  ) : null}
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    );

  if (isCompact) {
    return (
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-cub-off-white">Training Path</h2>
            <p className="mt-0.5 text-xs text-cub-muted">
              {active
                ? `${active.title} · ${active.approvedCount}/${active.totalCards} cards`
                : summary.completedDecks === summary.totalDecks && summary.totalDecks > 0
                  ? "All milestones complete"
                  : `${summary.completedDecks}/${summary.totalDecks} milestones`}
            </p>
          </div>
          <Link
            href={trainingHref}
            className="shrink-0 text-xs font-medium text-cub-gold hover:text-cub-gold-light"
          >
            Open →
          </Link>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-cub-charcoal">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cub-gold to-cub-gold-warm"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex-1">{content}</div>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className={cubSectionTitle}>Training Path</h2>
          <p className="text-sm text-cub-muted">
            {active
              ? `On ${active.title} · ${TRAINING_DECK_STATUS_LABELS[active.status]}`
              : `${summary.completedDecks}/${summary.totalDecks} milestones complete`}
          </p>
        </div>
        <Link
          href={trainingHref}
          className="shrink-0 text-sm font-medium text-cub-gold hover:text-cub-gold-light"
        >
          Training Path →
        </Link>
      </div>
      {content}
    </section>
  );
}
