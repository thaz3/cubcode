import Link from "next/link";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { CubAssignedTasksSection } from "@/components/cub-assigned-tasks-section";
import { CubRoutinesSection } from "@/components/cub-routines-section";
import { CubTodayEarnedSection } from "@/components/cub-today-earned-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { formatMinutes } from "@/lib/ledger-labels";
import { getCubRewardSummary } from "@/lib/rewards";
import { sortTasksByUrgency, filterTasksForCubWeekView } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getCubWeekEarnedTotals } from "@/lib/weekly-progress";
import { getCubRoutinesDueToday } from "@/lib/cub-routines";
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

  const [assignedTasks, summary, weekEarned, weekStats, routinesDueToday] =
    await Promise.all([
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
    getCubRewardSummary(cub),
    getCubWeekEarnedTotals(cub.id, weekStartsOn),
    getCubWeekStats(cub.id, weekStartsOn),
    getCubRoutinesDueToday(familyId, cub.id),
  ]);

  const weekAssigned = filterTasksForCubWeekView(assignedTasks, weekStartsOn);
  const sortedAssigned = sortTasksByUrgency(weekAssigned);
  const nextAction = getCubNextAction(weekAssigned, cubId);

  const activeFocus = weekAssigned
    .filter((t) => t.status === "IN_PROGRESS" && t.focusSessionStartedAt)
    .map((t) => ({
      id: t.id,
      title: t.title,
      focusSessionStartedAt: t.focusSessionStartedAt!.toISOString(),
    }));

  const cardVariant =
    nextAction.tone === "urgent"
      ? "accent"
      : nextAction.tone === "focus"
        ? "default"
        : "default";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">
          Hey, {cub.displayName}!
        </h1>
        <p className="mt-2 text-zinc-400">Here&apos;s what to do today.</p>
      </div>

      <Card variant={cardVariant} className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Your next step
          </p>
          <h2 className="mt-1 text-xl font-bold text-zinc-50">
            {nextAction.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">{nextAction.description}</p>
        </div>
        <Link href={nextAction.href}>
          <Button fullWidth size="lg">
            {nextAction.buttonLabel}
          </Button>
        </Link>
      </Card>

      <ActiveFocusTimersBanner cubName={cub.displayName} tasks={activeFocus} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="XP"
          value={String(summary.totalXp)}
          detail={summary.rank.current.name}
        />
        <StatCard
          label="Phone time"
          value={formatMinutes(summary.phoneMinutesAvailableToday)}
          detail="Available today"
        />
      </div>

      <CubTodayEarnedSection
        cubId={cubId}
        weekLabel={formatWeekLabel(weekStartsOn)}
        summary={summary}
        weekEarned={weekEarned}
        weekStats={weekStats}
      />

      <CubRoutinesSection cubId={cubId} routines={routinesDueToday} />

      <CubAssignedTasksSection cubId={cubId} tasks={sortedAssigned} />
    </div>
  );
}
