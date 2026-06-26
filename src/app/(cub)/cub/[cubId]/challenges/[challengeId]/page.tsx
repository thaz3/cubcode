import { ChallengeCheckInForm } from "@/components/challenge-check-in-form";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireCubForUser } from "@/lib/cub-access";
import {
  formatChallengeInterval,
  getCurrentInterval,
} from "@/lib/challenge-intervals";
import { getOrCreateCurrentProgressLog } from "@/lib/challenges";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
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
      <div className="space-y-5">
        <CubKidHero
          title={challenge.title}
          subtitle={formatChallengeInterval(
            challenge.intervalType,
            challenge.intervalConfig,
          )}
          emoji={CUB_PAGE_EMOJI.routines}
          backHref={`/cub/${cubId}/challenges`}
          backLabel="Routines"
        />
        <CubKidPanel variant="gold" contentClassName="text-sm text-cub-muted">
          This routine is not due today. Check back on the next scheduled day.
        </CubKidPanel>
      </div>
    );
  }

  const log = await getOrCreateCurrentProgressLog(challenge);

  return (
    <div className="space-y-5">
      <CubKidHero
        title={challenge.title}
        subtitle={formatChallengeInterval(
          challenge.intervalType,
          challenge.intervalConfig,
        )}
        emoji={CUB_PAGE_EMOJI.routines}
        backHref={`/cub/${cubId}/challenges`}
        backLabel="Routines"
      />

      {challenge.description ? (
        <p className="text-sm text-cub-muted">{challenge.description}</p>
      ) : null}

      <CubKidPanel variant="violet" contentClassName="p-1 sm:p-2">
        <ChallengeCheckInForm
          challenge={challenge}
          log={log}
          intervalLabel={interval.label}
        />
      </CubKidPanel>
    </div>
  );
}
