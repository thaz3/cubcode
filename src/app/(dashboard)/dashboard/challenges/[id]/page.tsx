import Link from "next/link";
import { ChallengeManageActions } from "@/components/challenge-manage-actions";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { CubColorBadge } from "@/components/cub-color-dot";
import { auth } from "@/lib/auth";
import { findRoutineGroupMembersByChallengeId } from "@/lib/assignment-routine-groups";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import {
  formatChallengeRewards,
  formatChallengeSummary,
} from "@/lib/challenge-labels";
import { notFound, redirect } from "next/navigation";

type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({
  params,
}: ChallengeDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const [challenge, familyChallenges] = await Promise.all([
    db.challenge.findFirst({
      where: { id, familyId: family.id },
      include: {
        cub: true,
        progressLogs: {
          orderBy: { intervalStart: "desc" },
          take: 10,
        },
        _count: {
          select: {
            progressLogs: {
              where: {
                status: { in: ["SUBMITTED", "SENT_BACK", "REJECTED", "REWARDED"] },
              },
            },
          },
        },
      },
    }),
    db.challenge.findMany({
      where: { familyId: family.id, status: { not: "ARCHIVED" } },
      include: { cub: true },
    }),
  ]);

  if (!challenge) notFound();

  const groupMembers = findRoutineGroupMembersByChallengeId(id, familyChallenges);
  const assignedCubs = groupMembers.map((member) => member.cub);

  const canHardDelete = challenge._count.progressLogs === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={challenge.title}
        subtitle={formatChallengeInterval(
          challenge.intervalType,
          challenge.intervalConfig,
        )}
        backHref="/dashboard/tasks#routines"
        backLabel="Routines"
        action={
          challenge.status !== "ARCHIVED" ? (
            <Link href={`/dashboard/challenges/${challenge.id}/edit`}>
              <Button variant="secondary" size="lg">
                Edit
              </Button>
            </Link>
          ) : null
        }
      />

      <Card className="space-y-3 p-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Assigned to
          </p>
          <div className="flex flex-wrap gap-2">
            {assignedCubs.map((cub) => (
              <CubColorBadge key={cub.id} cubId={cub.id} displayName={cub.displayName} />
            ))}
          </div>
        </div>
        {challenge.description ? (
          <p className="text-sm text-zinc-300">{challenge.description}</p>
        ) : null}
        <p className="text-sm text-zinc-500">{formatChallengeSummary(challenge)}</p>
        <p className="text-sm text-cub-gold/90">
          Per check-in: {formatChallengeRewards(challenge)}
        </p>
        <p className="text-xs text-zinc-500">
          Status:{" "}
          {challenge.status === "ARCHIVED"
            ? "Archived"
            : challenge.status === "PAUSED"
              ? "Paused"
              : "Active"}
        </p>
      </Card>

      {challenge.status !== "ARCHIVED" ? (
        <ChallengeManageActions
          challengeId={challenge.id}
          status={challenge.status}
          canHardDelete={canHardDelete}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Recent check-ins</h2>
        {challenge.progressLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">No check-ins yet.</p>
        ) : (
          <ul className="space-y-2">
            {challenge.progressLogs.map((log) => (
              <li key={log.id}>
                <Card className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm text-zinc-200">
                      {log.intervalStart.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {log.submittedAt ? (
                      <p className="text-xs text-zinc-500">
                        Submitted {log.submittedAt.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <ChallengeProgressBadge status={log.status} />
                    {log.status === "SUBMITTED" ? (
                      <Link href={`/dashboard/challenges/review/${log.id}`}>
                        <Button size="sm">Review</Button>
                      </Link>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
