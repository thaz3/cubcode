import Link from "next/link";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import {
  CubKidHero,
  CubKidPanel,
  CubKidStatBar,
  CubKidTipCard,
} from "@/components/cub-kid";
import { CubThisWeekSummarySection } from "@/components/cub-this-week-summary-section";
import { CubTodaysMissionsSection } from "@/components/cub-todays-missions-section";
import { GrowthAreasCard } from "@/components/growth-areas-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import {
  getCubActiveMissions,
  getCubWeekEarnSummary,
} from "@/lib/cub-week-earn-summary";
import { sumLedgerAmounts } from "@/lib/rewards";
import { filterTasksForCubWeekView } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import {
  nextActionButtonVariant,
} from "@/lib/cub-theme";
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

  const [assignedTasks, growthSummary, missions, weekSummary, ledger] = await Promise.all([
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
      <CubKidHero
        title={`Hey, ${cub.displayName}!`}
        subtitle="Your quest board is ready — pick a mission and level up."
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

      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            🎯 Next step
          </p>
          <h2 className="mt-1 text-xl font-black text-cub-off-white">
            {nextAction.title}
          </h2>
          <p className="mt-2 text-sm text-cub-muted">{nextAction.description}</p>
        </div>
        <Link href={nextAction.href}>
          <Button
            fullWidth
            size="lg"
            variant={nextActionButtonVariant("normal", nextAction.buttonLabel)}
            className="font-bold uppercase tracking-wide"
          >
            {nextAction.buttonLabel} ▶
          </Button>
        </Link>
      </CubKidPanel>

      <ActiveFocusTimersBanner cubName={cub.displayName} tasks={activeFocus} />
    </div>
  );
}
