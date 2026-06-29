import { ChallengeReviewCard } from "@/components/challenge-review-card";
import { FocusDeckReviewCard } from "@/components/focus-deck-review-card";
import { ReviewCard } from "@/components/review-card";
import { getTaskEarnType } from "@/lib/earn-types";
import type { ReviewQueueItem } from "@/lib/review-queue";

type AssignmentBoardReviewListProps = {
  items: ReviewQueueItem[];
};

export function AssignmentBoardReviewList({
  items,
}: AssignmentBoardReviewListProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => {
        if (item.kind === "routine") {
          return (
            <ChallengeReviewCard key={`routine-${item.log.id}`} log={item.log} />
          );
        }
        if (item.kind === "growth_pick") {
          return (
            <FocusDeckReviewCard
              key={`growth-${item.completion.id}`}
              completion={item.completion}
            />
          );
        }

        return (
          <ReviewCard
            key={`task-${item.id}`}
            task={{
              id: item.id,
              title: item.title,
              status: item.status,
              proofType: item.proofType,
              reflection: item.reflection,
              submittedAt: item.submittedAt,
              cub: item.cub,
            }}
            earnType={getTaskEarnType(item)}
            trainingLevelTitle={item.trainingDeckTitle}
          />
        );
      })}
    </div>
  );
}
