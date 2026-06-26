import Link from "next/link";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { CubAssignedTasksSection } from "@/components/cub-assigned-tasks-section";
import { CubFocusWeekSection } from "@/components/cub-focus-week-section";
import { CubRoutinesSection } from "@/components/cub-routines-section";
import { GrowthAreasCard } from "@/components/growth-areas-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { getWeekStart } from "@/lib/council-day";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import { sortTasksByUrgency, filterTasksForCubWeekView } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getCubWeeklyFocusStack } from "@/lib/cub-focus-deck-week";
import { getCubRoutinesDueToday } from "@/lib/cub-routines";
import {
  cubSectionLabel,
  nextActionButtonVariant,
  nextActionCardClass,
} from "@/lib/cub-theme";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

type CubTodayPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubTodayPage({ params }: CubTodayPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [assignedTasks, growthSummary, routinesDueToday, focusWeekCards] =
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
    getCubGrowthAreaSummary(cub, weekStartsOn),
    getCubRoutinesDueToday(familyId, cub.id),
    getCubWeeklyFocusStack(familyId, cub.id, weekStartsOn),
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

  const cardClass =
    nextAction.tone === "urgent"
      ? nextActionCardClass("urgent")
      : nextAction.tone === "focus"
        ? nextActionCardClass("normal")
        : nextActionCardClass("normal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cub-off-white sm:text-3xl">
          Hey, {cub.displayName}!
        </h1>
        <p className="mt-2 text-cub-gold-light/90">Here&apos;s what to do today.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CubRoutinesSection
          cubId={cubId}
          routines={routinesDueToday}
          variant="compact"
        />
        <CubAssignedTasksSection
          cubId={cubId}
          tasks={sortedAssigned}
          variant="compact"
        />
        <CubFocusWeekSection
          cubId={cubId}
          cards={focusWeekCards}
          variant="compact"
        />
      </div>

      <GrowthAreasCard
        summary={growthSummary}
        audience="cub"
        cubId={cubId}
        variant="mini"
      />

      <Card className={cn("space-y-4", cardClass)}>
        <div>
          <p className={cubSectionLabel}>Your next step</p>
          <h2 className="mt-1 text-xl font-bold text-cub-off-white">
            {nextAction.title}
          </h2>
          <p className="mt-2 text-sm text-cub-muted">{nextAction.description}</p>
        </div>
        <Link href={nextAction.href}>
          <Button
            fullWidth
            size="lg"
            variant={nextActionButtonVariant("normal", nextAction.buttonLabel)}
          >
            {nextAction.buttonLabel}
          </Button>
        </Link>
      </Card>

      <ActiveFocusTimersBanner cubName={cub.displayName} tasks={activeFocus} />
    </div>
  );
}
