import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import type { CubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { TRAINING_DECK_STATUS_LABELS } from "@/lib/training-board-progress";
import {
  cubKidSectionEyebrow,
  cubKidSectionTitle,
  cubKidTextMuted,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<
  CubTrainingBoardSummary["milestones"][number]["status"],
  string
> = {
  LOCKED: "bg-slate-100 text-slate-500 border-slate-200",
  UNLOCKED: "bg-kid-yellow/30 text-orange-700 border-kid-yellow/50",
  IN_PROGRESS: "bg-sky-100 text-sky-700 border-sky-200",
  COMPLETE: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
    <CubKidPanel variant="sky" className={className} contentClassName="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cubKidSectionEyebrow}>🗺️ Training Path</p>
          <h2 className={cn("mt-1 text-lg", cubKidSectionTitle)}>Your levels</h2>
          <p className={cn("mt-1 text-sm", cubKidTextMuted)}>
            {summary.completedDecks}/{summary.totalDecks} milestone
            {summary.totalDecks === 1 ? "" : "s"} complete ·{" "}
            {summary.totalCardsApproved}/{summary.totalCards} cards approved
          </p>
        </div>
        <Link
          href={`/cub/${cubId}/training`}
          className="rounded-2xl border-2 border-kid-purple/30 bg-kid-lavender/60 px-3 py-1.5 text-sm font-black text-kid-purple hover:bg-kid-lavender"
        >
          Open map →
        </Link>
      </div>

      <div>
        <div className={cn("flex items-center justify-between gap-2 text-xs", cubKidTextMuted)}>
          <span>Overall training progress</span>
          <span className="font-black text-kid-purple">{overallPct}%</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-kid-blue/20 bg-kid-sky/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kid-blue via-kid-purple to-kid-pink transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {summary.activeMilestone ? (
        <p className={cn("text-sm", cubKidTextMuted)}>
          Up next:{" "}
          <span className="font-black text-kid-ink">
            {summary.activeMilestone.title}
          </span>{" "}
          ({summary.activeMilestone.approvedCount}/{summary.activeMilestone.totalCards}{" "}
          cards)
        </p>
      ) : summary.completedDecks === summary.totalDecks && summary.totalDecks > 0 ? (
        <p className="text-sm font-black text-emerald-600">
          🏆 You finished every level on the Training Path!
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
                    "font-bold hover:underline",
                    milestone.status === "LOCKED"
                      ? "text-slate-400"
                      : "text-kid-ink",
                  )}
                >
                  Level {milestone.milestoneNumber}: {milestone.title}
                </Link>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-black uppercase tracking-wide",
                    STATUS_BADGE[milestone.status],
                  )}
                >
                  {TRAINING_DECK_STATUS_LABELS[milestone.status]}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-kid-lavender/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      milestone.status === "COMPLETE"
                        ? "bg-kid-green"
                        : milestone.status === "LOCKED"
                          ? "bg-slate-300"
                          : "bg-gradient-to-r from-kid-purple to-kid-blue",
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className={cn("shrink-0 text-xs font-bold", cubKidTextMuted)}>
                  {milestone.approvedCount}/{milestone.totalCards}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </CubKidPanel>
  );
}
