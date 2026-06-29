import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CubColorDot } from "@/components/cub-color-dot";
import { cubSectionTitle } from "@/lib/cub-theme";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { cn } from "@/lib/utils";
import type { getPendingReviewItems } from "@/lib/pending-review";

type PendingReviewData = Awaited<ReturnType<typeof getPendingReviewItems>>;

type ParentAwaitingReviewSectionProps = {
  items: PendingReviewData;
};

type ReviewQueueRow = {
  id: string;
  title: string;
  cubId: string;
  cubName: string;
  href: string;
  submittedAt: Date | null;
  kind: "task" | "focus" | "routine";
  isFocusTask: boolean;
};

const KIND_BADGE: Record<ReviewQueueRow["kind"], string> = {
  task: "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/35",
  focus: "bg-cub-green-muted text-cub-green-light ring-cub-green-bright/35",
  routine: "bg-violet-950 text-violet-200 ring-violet-400/30",
};

const KIND_LABEL: Record<ReviewQueueRow["kind"], string> = {
  task: "Task",
  focus: "Focus",
  routine: "Routine",
};

function formatSubmittedAt(date: Date | null) {
  if (!date) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildReviewRows(items: PendingReviewData): ReviewQueueRow[] {
  const rows: ReviewQueueRow[] = [];

  for (const task of items.tasks) {
    const isFocusTask =
      task.category === "FOCUS_BLOCK" || task.focusActivityCardId !== null;
    rows.push({
      id: `task-${task.id}`,
      title: task.title,
      cubId: task.cub?.id ?? "",
      cubName: task.cub?.displayName ?? "Cub",
      href: `/dashboard/tasks/review/${task.id}`,
      submittedAt: task.submittedAt,
      kind: isFocusTask ? "focus" : "task",
      isFocusTask,
    });
  }

  for (const completion of items.focusCompletions) {
    rows.push({
      id: `focus-${completion.id}`,
      title: completion.card.title,
      cubId: completion.cub.id,
      cubName: completion.cub.displayName,
      href: `/dashboard/focus-deck/review/${completion.id}`,
      submittedAt: completion.submittedAt,
      kind: "focus",
      isFocusTask: true,
    });
  }

  for (const log of items.challengeLogs) {
    rows.push({
      id: `routine-${log.id}`,
      title: log.challenge.title,
      cubId: log.cub.id,
      cubName: log.cub.displayName,
      href: `/dashboard/challenges/review/${log.id}`,
      submittedAt: log.submittedAt,
      kind: "routine",
      isFocusTask: false,
    });
  }

  return rows.sort((a, b) => {
    const aTime = a.submittedAt?.getTime() ?? 0;
    const bTime = b.submittedAt?.getTime() ?? 0;
    return aTime - bTime;
  });
}

export function ParentAwaitingReviewSection({
  items,
}: ParentAwaitingReviewSectionProps) {
  const rows = buildReviewRows(items);
  if (rows.length === 0) {
    return null;
  }

  return (
    <section id="awaiting-review" className="scroll-mt-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={cubSectionTitle}>Awaiting review</h2>
          <p className="mt-1 text-sm text-cub-muted">
            {rows.length} submission{rows.length === 1 ? "" : "s"} need your
            approval.
          </p>
        </div>
        <Link
          href="/dashboard/tasks#in-review"
          className="text-sm font-medium text-cub-gold"
        >
          Assignments →
        </Link>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => {
          const submittedLabel = formatSubmittedAt(row.submittedAt);
          return (
            <li key={row.id}>
              <Link
                href={row.href}
                className={cn(
                  "block rounded-2xl border border-cub-gold/35 cub-card-gold p-4 shadow-sm transition hover:border-cub-gold/55 hover:shadow-md",
                  cubAccentClassNames(row.cubId, { border: true }),
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                      KIND_BADGE[row.kind],
                    )}
                  >
                    {KIND_LABEL[row.kind]}
                  </span>
                  <span className="font-medium text-cub-off-white">
                    {row.title}
                  </span>
                </div>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-cub-muted">
                  <CubColorDot cubId={row.cubId} />
                  {row.cubName}
                  {submittedLabel ? ` · Submitted ${submittedLabel}` : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/dashboard/tasks#in-review">
        <Button variant="reward" fullWidth>
          Review on assignments
        </Button>
      </Link>
    </section>
  );
}
