import Link from "next/link";
import { Button } from "@/components/ui/button";

type WaitingForReviewNoticeProps = {
  reviewHref: string;
  /** Single task title — use on task detail pages. */
  taskTitle?: string;
  /** Number of tasks — use on list/overview pages. */
  count?: number;
};

export function WaitingForReviewNotice({
  reviewHref,
  taskTitle,
  count,
}: WaitingForReviewNoticeProps) {
  let headline: string;
  if (taskTitle) {
    headline = `"${taskTitle}" is waiting for your review.`;
  } else if (count === 1) {
    headline = "1 task is waiting for your review.";
  } else if (count != null && count > 1) {
    headline = `${count} tasks are waiting for your review.`;
  } else {
    headline = "A task is waiting for your review.";
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
      <p className="font-medium text-amber-900 dark:text-amber-100">{headline}</p>
      <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/90">
        Your Cub submitted their work. Review their proof to approve rewards, send
        it back for changes, or reject the submission.
      </p>
      <Link href={reviewHref} className="mt-3 inline-block">
        <Button>Review now</Button>
      </Link>
    </div>
  );
}
