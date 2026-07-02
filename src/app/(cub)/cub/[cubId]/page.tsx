import { MissionHashScroll } from "@/components/mission-hash-scroll";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { PrivateBetaBanner } from "@/components/private-beta-banner";
import { DenOverviewDashboard } from "@/components/den-overview/den-overview-dashboard";
import {
  CubKidHero,
  CubKidStatBar,
  CubAccumulatedRewardsPanel,
} from "@/components/cub-kid";
import { CubThisWeekSummarySection } from "@/components/cub-this-week-summary-section";
import { CubNextStepSection } from "@/components/cub-next-step-section";
import { CubTodaysMissionsSection } from "@/components/cub-todays-missions-section";
import { CubTrainingPathAssignmentsSection } from "@/components/cub-training-path-assignments-section";
import { GrowthAreasCard } from "@/components/growth-areas-card";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubTrainingPathAssignments } from "@/lib/cub-training-board-summary";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import { getDenOverviewData } from "@/lib/den-overview-data";
import {
  getCubActiveMissions,
  getCubWeekEarnSummary,
} from "@/lib/cub-week-earn-summary";
import { getCubRewardSummary } from "@/lib/rewards";
import { getFamilyForUser } from "@/lib/session";
import { filterTasksForCubWeekView } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type CubTodayPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubTodayPage({ params }: CubTodayPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();
  const family = await getFamilyForUser(session.user.id);
  const isParent = family?.ownerId === session.user.id;
  const familyCubs =
    family?.cubs.map((item) => ({
      id: item.id,
      displayName: item.displayName,
    })) ?? [];

  const [
    assignedTasks,
    growthSummary,
    missions,
    weekSummary,
    rewardSummary,
    denOverview,
    trainingPath,
  ] = await Promise.all([
    db.task.findMany({
      where: {
        familyId,
        cubId: cub.id,
        status: { in: ACTIVE_CUB_STATUSES },
      },
      select: {
        id: true,
        title: true,
        status: true,
        focusSessionStartedAt: true,
        claimedAt: true,
        dueAt: true,
        dueAtHasTime: true,
        createdAt: true,
        isUrgent: true,
      },
    }),
    getCubGrowthAreaSummary(cub, weekStartsOn),
    getCubActiveMissions(familyId, cub.id, weekStartsOn),
    getCubWeekEarnSummary(familyId, cub.id, weekStartsOn),
    getCubRewardSummary(cub),
    getDenOverviewData(familyId, cub, weekStartsOn),
    getCubTrainingPathAssignments(familyId, cub.id),
  ]);

  const weekAssigned = filterTasksForCubWeekView(assignedTasks, weekStartsOn);
  const nextAction = getCubNextAction(weekAssigned, cubId);

  const activeFocus = weekAssigned
    .filter((t) => t.status === "IN_PROGRESS" && t.focusSessionStartedAt)
    .map((t) => ({
      id: t.id,
      title: t.title,
      focusSessionStartedAt: t.focusSessionStartedAt!.toISOString(),
    }));

  return (
    <div className="space-y-5">
      <MissionHashScroll />
      <PrivateBetaBanner variant="kid" />
      <CubKidHero
        title={`Hey, ${cub.displayName}!`}
        subtitle="Welcome to Cub HQ — check your missions, see what's coming up, and keep your streak going!"
        emoji={CUB_PAGE_EMOJI.today}
      />

      <CubKidStatBar
        leftIcon="🔥"
        leftTitle={
          missions.length > 0
            ? `${missions.length} mission${missions.length === 1 ? "" : "s"} today`
            : "All clear for today!"
        }
        leftSubtitle={
          missions.length > 0
            ? missions.length === 1
              ? "1 Mission Left — tap to jump in!"
              : "Tap a mission card to get started."
            : "Nothing due today. Nice work, Cub!"
        }
      />

      <CubNextStepSection action={nextAction} />

      <CubAccumulatedRewardsPanel summary={rewardSummary} cubId={cubId} />

      <CubTodaysMissionsSection missions={missions} variant="compact" />

      <CubTrainingPathAssignmentsSection
        cubId={cubId}
        assignments={trainingPath.assignments}
        summary={trainingPath.summary}
      />

      <section id="den" className="scroll-mt-24">
        <DenOverviewDashboard
          cubId={cubId}
          isParent={isParent}
          cubs={familyCubs}
          data={denOverview}
          initialSelectedDay={
            denOverview.weekDays.find((day) => day.isToday)?.dateKey ??
            denOverview.weekDays[0]?.dateKey ??
            ""
          }
        />
      </section>

      <CubThisWeekSummarySection
        cubId={cubId}
        summary={weekSummary}
        variant="compact"
      />

      <GrowthAreasCard
        summary={growthSummary}
        audience="cub"
        cubId={cubId}
        variant="mini"
      />

      <ActiveFocusTimersBanner cubName={cub.displayName} tasks={activeFocus} />
    </div>
  );
}
