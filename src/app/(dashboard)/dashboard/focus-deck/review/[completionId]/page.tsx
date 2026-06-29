import { FocusDeckReviewForm } from "@/components/focus-deck-review-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { formatFocusDeckCategoryPoints, parseFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatTaskRewards } from "@/lib/task-labels";
import { redirect, notFound } from "next/navigation";

type FocusDeckReviewPageProps = {
  params: Promise<{ completionId: string }>;
};

export default async function FocusDeckReviewPage({
  params,
}: FocusDeckReviewPageProps) {
  const { completionId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const completion = await db.focusActivityCompletion.findFirst({
    where: { id: completionId, familyId: family.id },
    include: {
      card: true,
      cub: { select: { displayName: true } },
    },
  });
  if (!completion) notFound();

  const points = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
  const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={completion.card.title}
        subtitle={`${completion.cub.displayName} · Focus card review`}
        backHref="/dashboard/tasks#in-review"
        backLabel="Assignments"
      />

      <Card className="space-y-4">
        {completion.card.instructions ? (
          <p className="text-sm text-zinc-300">{completion.card.instructions}</p>
        ) : null}
        {pointsLabel ? (
          <p className="text-sm font-medium text-cub-gold/90">Growth: {pointsLabel}</p>
        ) : null}
        <p className="text-sm text-zinc-400">
          Rewards on approval: {formatTaskRewards(completion.card)}
        </p>
        {completion.reflection ? (
          <div className="rounded-xl bg-cub-ebony/60 px-4 py-3 text-sm text-zinc-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-cub-muted">
              Reflection
            </p>
            <p className="mt-2 whitespace-pre-wrap">{completion.reflection}</p>
          </div>
        ) : null}
        {completion.proofLink ? (
          <p className="text-sm text-cub-gold-light">
            Proof:{" "}
            <a href={completion.proofLink} className="underline" target="_blank" rel="noreferrer">
              {completion.proofLink}
            </a>
          </p>
        ) : null}

        {completion.status === "SUBMITTED" ? (
          <FocusDeckReviewForm completionId={completion.id} />
        ) : (
          <p className="text-sm text-zinc-500">Status: {completion.status}</p>
        )}
      </Card>
    </div>
  );
}
