import { ChecklistDisplay } from "@/components/checklist-display";
import { ChallengeReviewForm } from "@/components/challenge-review-form";
import { CubLink } from "@/components/cub-link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import {
  formatChallengeRewards,
  formatChallengeSummary,
} from "@/lib/challenge-labels";
import { getChallengeChecklistItems } from "@/lib/challenge-checklist";
import { formatProofType } from "@/lib/task-labels";
import { notFound, redirect } from "next/navigation";

type ReviewChallengeProgressPageProps = {
  params: Promise<{ logId: string }>;
};

export default async function ReviewChallengeProgressPage({
  params,
}: ReviewChallengeProgressPageProps) {
  const { logId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const log = await db.challengeProgressLog.findFirst({
    where: { id: logId, familyId: family.id },
    include: { challenge: true, cub: true },
  });

  if (!log) notFound();

  const checklistItems = getChallengeChecklistItems(log.challenge);
  const checklist =
    log.checklistData && typeof log.checklistData === "object"
      ? (log.checklistData as Record<string, boolean>)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={log.challenge.title}
        subtitle="Review routine check-in"
        backHref="/dashboard/tasks/review"
        backLabel="Review"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-950 px-2 py-0.5 text-xs font-semibold text-violet-300">
          Routine
        </span>
        <ChallengeProgressBadge status={log.status} />
        <CubLink
          cubId={log.cub.id}
          displayName={log.cub.displayName}
          className="text-sm text-zinc-400 hover:text-cub-gold-light"
        />
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Check-in</h2>
          <p className="text-sm text-zinc-500">
            {formatChallengeInterval(
              log.challenge.intervalType,
              log.challenge.intervalConfig,
            )}{" "}
            · {formatChallengeSummary(log.challenge)}
          </p>
          <p className="text-sm text-cub-gold/90">
            On approval: {formatChallengeRewards(log.challenge)}
          </p>
          <p className="text-sm text-zinc-500">
            Interval:{" "}
            {log.intervalStart.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>

          {log.challenge.proofPrompt ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Instructions</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">
                {log.challenge.proofPrompt}
              </p>
            </div>
          ) : null}

          <p className="text-sm text-zinc-500">
            Proof: {formatProofType(log.challenge.proofType)}
          </p>

          {log.reflection ? (
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Reflection</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                {log.reflection}
              </p>
            </div>
          ) : null}

          {checklist && checklistItems.length > 0 ? (
            <ChecklistDisplay items={checklistItems} checked={checklist} />
          ) : null}

          {log.submittedAt ? (
            <p className="text-xs text-zinc-500">
              Submitted {log.submittedAt.toLocaleString()}
            </p>
          ) : null}
        </Card>

        {log.status === "SUBMITTED" ? (
          <ChallengeReviewForm logId={log.id} />
        ) : (
          <Card className="p-4 text-sm text-zinc-400">
            This check-in is no longer waiting for review.
          </Card>
        )}
      </div>
    </div>
  );
}
