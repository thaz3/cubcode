import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import type {
  CubTrainingBoardSummary,
  CubTrainingPathAssignment,
} from "@/lib/cub-training-board-summary";
import {
  cubKidBadge,
  cubKidEmptyState,
  cubKidGameCard,
  KID_EARN_CARD,
} from "@/lib/cub-kid-theme";
import { MISSION_FLAIR } from "@/lib/active-mission-flair";
import type { TrainingCardBoardStatus } from "@/lib/training-board-progress";
import { cn } from "@/lib/utils";

type CubTrainingPathAssignmentsSectionProps = {
  cubId: string;
  assignments: CubTrainingPathAssignment[];
  summary: CubTrainingBoardSummary;
  variant?: "today" | "quest-board";
};

function getCurrentQuestLabel(
  assignments: CubTrainingPathAssignment[],
  activeMilestone: CubTrainingBoardSummary["activeMilestone"],
): string | null {
  const currentAssignment =
    assignments.find((item) => assignmentNeedsAttention(item.boardStatus)) ??
    assignments[0];

  if (currentAssignment) {
    return `Quest: ${currentAssignment.title}`;
  }

  if (activeMilestone) {
    const nextLesson = Math.min(
      activeMilestone.approvedCount + 1,
      activeMilestone.totalCards,
    );
    return `Level ${activeMilestone.milestoneNumber}: ${activeMilestone.title} — lesson ${nextLesson} of ${activeMilestone.totalCards}`;
  }

  return null;
}

function assignmentActionLabel(status: TrainingCardBoardStatus): string {
  switch (status) {
    case "NEEDS_WORK":
      return "Try again";
    case "SUBMITTED":
      return "View submission";
    case "ASSIGNED":
    default:
      return "Play lesson";
  }
}

function assignmentNeedsAttention(status: TrainingCardBoardStatus): boolean {
  return status === "ASSIGNED" || status === "NEEDS_WORK";
}

export function CubTrainingPathAssignmentsSection({
  cubId,
  assignments,
  summary,
  variant = "today",
}: CubTrainingPathAssignmentsSectionProps) {
  const trainingHref = `/cub/${cubId}/training`;
  const activeMilestone = summary.activeMilestone;
  const flair = MISSION_FLAIR.training_path;
  const kidCard = KID_EARN_CARD.training_path;
  const attentionCount = assignments.filter((item) =>
    assignmentNeedsAttention(item.boardStatus),
  ).length;
  const isQuestBoard = variant === "quest-board";
  const currentQuestLabel = getCurrentQuestLabel(assignments, activeMilestone);
  const currentAssignment =
    assignments.find((item) => assignmentNeedsAttention(item.boardStatus)) ??
    assignments[0] ??
    null;

  return (
    <CubKidPanel variant="violet" contentClassName="space-y-3">
      <CubKidSectionHeader
        eyebrow="🗺️ Training Path"
        title={isQuestBoard ? "Training Path quest" : "Your lessons"}
        subtitle={
          currentQuestLabel ??
          (isQuestBoard
            ? "Your parent assigns lessons as you unlock each level."
            : "Level up through lessons your parent assigns.")
        }
        compact={!isQuestBoard}
        trailing={
          <Link href={trainingHref} className={cubKidBadge}>
            {isQuestBoard ? "Quest map →" : "Map →"}
          </Link>
        }
      />

      {activeMilestone ? (
        <div className="rounded-2xl border-2 border-violet-300/40 bg-white/70 px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
            {isQuestBoard ? "Your level" : "Current level"}
          </p>
          <p className="mt-0.5 text-sm font-black text-kid-ink">
            Level {activeMilestone.milestoneNumber}: {activeMilestone.title}
          </p>
          <p className="mt-0.5 text-xs text-kid-ink-muted">
            {activeMilestone.approvedCount}/{activeMilestone.totalCards} lessons
            complete
          </p>
        </div>
      ) : null}

      {currentAssignment && isQuestBoard ? (
        <Link
          href={`/cub/${cubId}/tasks/${currentAssignment.taskId}`}
          className={cn(
            "block rounded-2xl border-[3px] bg-gradient-to-br p-4 transition hover:-translate-y-0.5",
            cubKidGameCard,
            kidCard.border,
            kidCard.accent,
            flair.glowClass,
            "ring-2 ring-violet-400/50",
          )}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
            ▶ Current quest
          </p>
          <p className="mt-1 text-lg font-black text-kid-ink">
            {currentAssignment.title}
          </p>
          <p className="mt-1 text-xs text-kid-ink-muted">
            Level {currentAssignment.milestoneNumber} · {currentAssignment.deckTitle}
          </p>
          <p className="mt-2 text-xs font-black uppercase text-violet-700">
            {assignmentActionLabel(currentAssignment.boardStatus)} →
          </p>
        </Link>
      ) : null}

      {assignments.length === 0 ? (
        <div className={cubKidEmptyState}>
          <p className="text-2xl" aria-hidden>
            🗺️
          </p>
          <p className="mt-2 text-sm font-black text-kid-ink">
            No lessons assigned yet
          </p>
          <p className="mt-0.5 text-xs text-kid-ink-muted">
            When your parent assigns a Training Path lesson, it will show up
            here.
          </p>
          <Link
            href={trainingHref}
            className="mt-3 inline-block text-xs font-black uppercase tracking-wide text-violet-700"
          >
            Explore the map →
          </Link>
        </div>
      ) : (
        <>
          {attentionCount > 0 && !isQuestBoard ? (
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              {attentionCount} lesson{attentionCount === 1 ? "" : "s"} ready
            </p>
          ) : null}
          {isQuestBoard && assignments.length > 1 ? (
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              More Training Path quests
            </p>
          ) : null}
          <ul className="space-y-2">
            {assignments.map((assignment) => {
              const urgent = assignmentNeedsAttention(assignment.boardStatus);
              const href = `/cub/${cubId}/tasks/${assignment.taskId}`;
              const isFeaturedQuest =
                isQuestBoard && currentAssignment?.taskId === assignment.taskId;

              if (isFeaturedQuest) {
                return null;
              }

              return (
                <li key={assignment.taskId}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-2xl border-[3px] bg-gradient-to-br p-3.5 transition hover:-translate-y-0.5",
                      cubKidGameCard,
                      kidCard.border,
                      kidCard.accent,
                      flair.glowClass,
                      urgent && "ring-2 ring-violet-400/50",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <EarnTypeBadge earnType="training_path" size="sm" />
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              urgent
                                ? "bg-violet-200 text-violet-800"
                                : "bg-slate-200 text-slate-700",
                            )}
                          >
                            {assignment.statusLabel}
                          </span>
                        </div>
                        <p className="font-black text-kid-ink">{assignment.title}</p>
                        <p className="text-xs text-kid-ink-muted">
                          Level {assignment.milestoneNumber} · {assignment.deckTitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-black uppercase tracking-wide text-violet-700">
                        {assignmentActionLabel(assignment.boardStatus)} →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </CubKidPanel>
  );
}
