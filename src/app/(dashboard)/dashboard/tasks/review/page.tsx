import { ReviewQueueByEarnType, type ReviewQueueItem } from "@/components/review-queue-by-earn-type";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { WaysToEarnSection } from "@/components/ways-to-earn-section";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskReviewQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const [tasks, challengeLogs, focusCompletions, trainingDecks] = await Promise.all([
    db.task.findMany({
      where: { familyId: family.id, status: "SUBMITTED" },
      include: { cub: true },
      orderBy: { submittedAt: "asc" },
    }),
    db.challengeProgressLog.findMany({
      where: { familyId: family.id, status: "SUBMITTED" },
      include: {
        cub: true,
        challenge: {
          select: {
            title: true,
            intervalType: true,
            intervalConfig: true,
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    }),
    db.focusActivityCompletion.findMany({
      where: { familyId: family.id, status: "SUBMITTED" },
      include: {
        cub: true,
        card: { select: { title: true, categoryPoints: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    db.trainingDeck.findMany({
      where: { familyId: family.id },
      select: { id: true, title: true },
    }),
  ]);

  const deckTitleById = new Map(trainingDecks.map((deck) => [deck.id, deck.title]));

  const queueItems: ReviewQueueItem[] = [
    ...tasks.map((task) => ({
      kind: "task" as const,
      id: task.id,
      title: task.title,
      status: task.status,
      proofType: task.proofType,
      reflection: task.reflection,
      submittedAt: task.submittedAt,
      cub: task.cub,
      focusActivityCardId: task.focusActivityCardId,
      trainingDeckId: task.trainingDeckId,
      trainingDeckTitle: task.trainingDeckId
        ? (deckTitleById.get(task.trainingDeckId) ?? null)
        : null,
    })),
    ...challengeLogs.map((log) => ({
      kind: "routine" as const,
      log,
    })),
    ...focusCompletions.map((completion) => ({
      kind: "growth_pick" as const,
      completion,
    })),
  ];

  const totalPending = queueItems.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Review"
        subtitle={
          totalPending > 0
            ? `${totalPending} submission${totalPending === 1 ? "" : "s"} waiting for your decision`
            : "Parent approval inbox — filter by earn type"
        }
        backHref="/dashboard"
        backLabel="Today"
      />

      {totalPending === 0 ? (
        <EmptyState
          title="You're caught up"
          description="When a Cub submits work from any earn type, it will show up here for approval."
          actionLabel="View assignments"
          actionHref="/dashboard/tasks"
        />
      ) : (
        <ReviewQueueByEarnType items={queueItems} />
      )}

      <WaysToEarnSection audience="parent" variant="compact" />
    </div>
  );
}
