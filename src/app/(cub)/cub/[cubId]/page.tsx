import { MissionHashScroll } from "@/components/mission-hash-scroll";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { DenOverviewDashboard } from "@/components/den-overview/den-overview-dashboard";
import {
  CubKidHero,
  CubKidStatBar,
} from "@/components/cub-kid";
import { CubThisWeekSummarySection } from "@/components/cub-this-week-summary-section";
import { CubNextStepSection } from "@/components/cub-next-step-section";
import { CubTodaysMissionsSection } from "@/components/cub-todays-missions-section";
import { GrowthAreasCard } from "@/components/growth-areas-card";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import { getDenOverviewData } from "@/lib/den-overview-data";
import {
  getCubActiveMissions,
  getCubWeekEarnSummary,
} from "@/lib/cub-week-earn-summary";
import { sumLedgerAmounts } from "@/lib/rewards";
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
    ledger,
    denOverview,
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
      },
    }),
    getCubGrowthAreaSummary(cub, weekStartsOn),
    getCubActiveMissions(familyId, cub.id, weekStartsOn),
    getCubWeekEarnSummary(familyId, cub.id, weekStartsOn),
    sumLedgerAmounts(cub.id),
    getDenOverviewData(familyId, cub, weekStartsOn),
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
      <CubKidHero
        title={`Hey, ${cub.displayName}!`}
        subtitle="Your Den at a glance — missions, deadlines, routines, and family plans."
        emoji={CUB_PAGE_EMOJI.today}
      />

      <CubKidStatBar
        leftIcon="⚔️"
        leftTitle={
          missions.length > 0
            ? `${missions.length} active mission${missions.length === 1 ? "" : "s"}`
            : "Quest board cleared!"
        }
        leftSubtitle={
          missions.length > 0
            ? "Tap a mission tile to jump in."
            : "Nice work — check back for new quests."
        }
        rightValue={ledger.totalXp}
      />

      <CubTodaysMissionsSection missions={missions} variant="compact" />

      <CubNextStepSection action={nextAction} />

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
