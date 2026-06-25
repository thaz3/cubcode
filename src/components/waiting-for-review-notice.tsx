import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type WaitingForReviewNoticeProps = {
  reviewHref: string;
  taskTitle?: string;
  count?: number;
};

export function WaitingForReviewNotice({
  reviewHref,
  taskTitle,
  count,
}: WaitingForReviewNoticeProps) {
  let headline: string;
  if (taskTitle) {
    headline = `"${taskTitle}" needs your review`;
  } else if (count === 1) {
    headline = "1 task needs your review";
  } else if (count != null && count > 1) {
    headline = `${count} tasks need your review`;
  } else {
    headline = "A task needs your review";
  }

  return (
    <Card variant="accent" className="space-y-3">
      <p className="font-semibold text-cub-gold-light">{headline}</p>
      <p className="text-sm text-cub-muted">
        Approve rewards, send back for changes, or reject.
      </p>
      <Link href={reviewHref}>
        <Button variant="reward" fullWidth size="lg">
          Review now
        </Button>
      </Link>
    </Card>
  );
}
