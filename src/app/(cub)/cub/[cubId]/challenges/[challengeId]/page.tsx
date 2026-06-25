import { ChallengeCheckInForm } from "@/components/challenge-check-in-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireCubForUser } from "@/lib/cub-access";
import {
  formatChallengeInterval,
  getCurrentInterval,
} from "@/lib/challenge-intervals";
import { getOrCreateCurrentProgressLog } from "@/lib/challenges";
import { notFound, redirect } from "next/navigation";

type CubRoutineDetailPageProps = {
  params: Promise<{ cubId: string; challengeId: string }>;
};

export default async function CubRoutineDetailPage({
  params,
}: CubRoutineDetailPageProps) {
  const { cubId, challengeId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);

  const challenge = await db.challenge.findFirst({
    where: {
      id: challengeId,
      familyId,
      cubId: cub.id,
      status: "ACTIVE",
    },
  });

  if (!challenge) notFound();

  const interval = getCurrentInterval(challenge);
  if (!interval) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={challenge.title}
          subtitle={formatChallengeInterval(
            challenge.intervalType,
            challenge.intervalConfig,
          )}
          backHref={`/cub/${cubId}/challenges`}
          backLabel="Routines"
        />
        <Card className="p-4 text-sm text-zinc-400">
          This routine is not due today. Check back on the next scheduled day.
        </Card>
      </div>
    );
  }

  const log = await getOrCreateCurrentProgressLog(challenge);

  return (
    <div className="space-y-6">
      <PageHeader
        title={challenge.title}
        subtitle={formatChallengeInterval(
          challenge.intervalType,
          challenge.intervalConfig,
        )}
        backHref={`/cub/${cubId}/challenges`}
        backLabel="Routines"
      />

      {challenge.description ? (
        <p className="text-sm text-zinc-400">{challenge.description}</p>
      ) : null}

      <Card className="p-4 sm:p-6">
        <ChallengeCheckInForm
          challenge={challenge}
          log={log}
          intervalLabel={interval.label}
        />
      </Card>
    </div>
  );
}
