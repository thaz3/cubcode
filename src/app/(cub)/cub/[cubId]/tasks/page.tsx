import { MissionHashScroll } from "@/components/mission-hash-scroll";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import {
  CubWorkflowTaskCard,
  type FocusGrowthContext,
} from "@/components/cub-workflow-task-card";
import { CubWorkflowRoutineCard } from "@/components/cub-workflow-routine-card";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getOrCreateCurrentProgressLog } from "@/lib/challenges";
import { db } from "@/lib/db";
import {
  formatGrowthWeekProgress,
  getAvailableGrowthCategoriesForCub,
  getCompletedGrowthCategoriesThisWeek,
  growthCategoryOptionsForCub,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubRoutinesView } from "@/lib/cub-routines";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import {
  filterTasksForCubWeekView,
  isTaskOverdue,
  isTaskUrgent,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { redirect } from "next/navigation";

type CubTasksPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubOverviewPage({ params }: CubTasksPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [tasks, completedGrowth, availableGrowth, routinesView] = await Promise.all([
    db.task.findMany({
      where: { familyId, cubId: cub.id },
      include: {
        focusBlocks: { select: { durationMinutes: true } },
      },
    }),
    getCompletedGrowthCategoriesThisWeek(cub.id),
    getAvailableGrowthCategoriesForCub(cub),
    getCubRoutinesView(familyId, cub.id),
  ]);

  const requiredGrowth = parseRequiredGrowthCategories(cub);
  const focusGrowth: FocusGrowthContext = {
    availableGrowthAreas: growthCategoryOptionsForCub(cub).filter((option) =>
      availableGrowth.includes(option.value),
    ),
    weekProgressLabel: formatGrowthWeekProgress(completedGrowth, requiredGrowth),
  };

  const weekTasks = filterTasksForCubWeekView(tasks, weekStartsOn);
  const urgentTasks = weekTasks.filter((task) => isTaskUrgent(task));
  const sortedTasks = sortTasksByUrgency(weekTasks);
  const nonUrgentTasks = sortedTasks.filter((task) => !isTaskUrgent(task));

  const dueChallengeIds = routinesView.dueToday.map((routine) => routine.id);
  const upcomingChallengeIds = routinesView.upcoming.map((routine) => routine.id);
  const allRoutineIds = [...dueChallengeIds, ...upcomingChallengeIds];

  const challenges =
    allRoutineIds.length > 0
      ? await db.challenge.findMany({
          where: {
            id: { in: allRoutineIds },
            familyId,
            cubId: cub.id,
            status: "ACTIVE",
          },
        })
      : [];

  const dueRoutines = await Promise.all(
    routinesView.dueToday.map(async (preview) => {
      const challenge = challenges.find((item) => item.id === preview.id);
      if (!challenge) return null;

      const log = await getOrCreateCurrentProgressLog(challenge);
      return {
        challenge,
        log,
        intervalLabel: preview.intervalLabel ?? "",
      };
    }),
  );

  const upcomingRoutines = routinesView.upcoming
    .map((preview) => {
      const challenge = challenges.find((item) => item.id === preview.id);
      if (!challenge) return null;

      return {
        challenge,
        intervalLabel: formatChallengeInterval(
          preview.intervalType,
          preview.intervalConfig,
        ),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const activeFocusTasks = sortedTasks
    .filter(
      (task) =>
        task.status === "IN_PROGRESS" && task.focusSessionStartedAt !== null,
    )
    .map((task) => ({
      id: task.id,
      title: task.title,
      focusSessionStartedAt: task.focusSessionStartedAt!.toISOString(),
    }));

  const totalItems =
    sortedTasks.length + dueRoutines.filter(Boolean).length + upcomingRoutines.length;

  return (
    <div className="space-y-5">
      <MissionHashScroll />
      <CubKidHero
        title="Overview"
        subtitle={`Everything assigned to you · ${formatWeekLabel(weekStartsOn)}.`}
        emoji={CUB_PAGE_EMOJI.overview}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <ActiveFocusTimersBanner
        cubName={cub.displayName}
        tasks={activeFocusTasks}
      />

      {urgentTasks.length > 0 ? (
        <CubKidPanel variant="gold" contentClassName="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            ⚡ Priority quests
          </p>
          <h2 className="text-lg font-black text-cub-off-white">Do these first</h2>
          <p className="text-sm text-cub-muted">
            Due soon or overdue — tackle these before anything else.
          </p>
        </CubKidPanel>
      ) : null}

      {totalItems === 0 ? (
        <EmptyState
          title="Nothing assigned yet"
          description="When your parent assigns tasks or routines, they will show up here."
        />
      ) : (
        <SwipeCardDeck>
          {urgentTasks.map((task) => (
            <div key={`task-${task.id}`} id={`mission-${task.id}`} className="scroll-mt-24">
              <CubWorkflowTaskCard
                task={task}
                cubId={cub.id}
                focusGrowth={task.category === "FOCUS_BLOCK" ? focusGrowth : null}
              />
            </div>
          ))}

          {dueRoutines.map((routine) =>
            routine ? (
              <div
                key={`routine-${routine.challenge.id}`}
                id={`mission-routine-${routine.challenge.id}`}
                className="scroll-mt-24"
              >
                <CubWorkflowRoutineCard
                  cubId={cub.id}
                  challenge={routine.challenge}
                  log={routine.log}
                  intervalLabel={routine.intervalLabel}
                  dueNow
                />
              </div>
            ) : null,
          )}

          {nonUrgentTasks.map((task) => (
            <div key={`task-${task.id}`} id={`mission-${task.id}`} className="scroll-mt-24">
              <CubWorkflowTaskCard
                task={task}
                cubId={cub.id}
                focusGrowth={task.category === "FOCUS_BLOCK" ? focusGrowth : null}
              />
            </div>
          ))}

          {upcomingRoutines.map((routine) => (
            <div
              key={`routine-upcoming-${routine.challenge.id}`}
              id={`mission-routine-${routine.challenge.id}`}
              className="scroll-mt-24"
            >
              <CubWorkflowRoutineCard
                cubId={cub.id}
                challenge={routine.challenge}
                log={null}
                intervalLabel={routine.intervalLabel}
                dueNow={false}
              />
            </div>
          ))}
        </SwipeCardDeck>
      )}
    </div>
  );
}
