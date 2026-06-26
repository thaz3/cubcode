import { ReviewCard } from "@/components/review-card";
import { ChallengeReviewCard } from "@/components/challenge-review-card";
import { FocusDeckReviewCard } from "@/components/focus-deck-review-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskReviewQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const [tasks, challengeLogs, focusCompletions] = await Promise.all([
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
  ]);

  const totalPending = tasks.length + challengeLogs.length + focusCompletions.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review"
        subtitle={
          totalPending > 0
            ? `${totalPending} submission${totalPending === 1 ? "" : "s"} waiting for your decision`
            : "Parent approval inbox"
        }
        backHref="/dashboard"
        backLabel="Today"
      />

      {totalPending === 0 ? (
        <EmptyState
          title="You're caught up"
          description="When a Cub submits a task or routine check-in, it will show up here for approval."
          actionLabel="View tasks"
          actionHref="/dashboard/tasks"
        />
      ) : (
        <div className="space-y-8">
          {tasks.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Task submissions</h2>
                <p className="text-sm text-zinc-500">
                  One-time tasks waiting for approval.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                  <ReviewCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          ) : null}

          {challengeLogs.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Routine check-ins
                </h2>
                <p className="text-sm text-zinc-500">
                  Repeating challenge intervals waiting for approval.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {challengeLogs.map((log) => (
                  <ChallengeReviewCard key={log.id} log={log} />
                ))}
              </div>
            </section>
          ) : null}

          {focusCompletions.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Focus cards</h2>
                <p className="text-sm text-zinc-500">
                  Focus Deck activity submissions waiting for approval.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {focusCompletions.map((completion) => (
                  <FocusDeckReviewCard key={completion.id} completion={completion} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
