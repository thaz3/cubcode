import { MissionHashScroll } from "@/components/mission-hash-scroll";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { CubTasksQuestSection } from "@/components/cub-tasks-quest-section";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { CubUpcomingRoutinesSection } from "@/components/cub-upcoming-routines-section";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI, cubKidGameCard, cubKidSectionEyebrow, KID_EARN_CARD } from "@/lib/cub-kid-theme";
import { getCubRoutinesView } from "@/lib/cub-routines";
import {
  formatGrowthWeekProgress,
  getAvailableGrowthCategoriesForCub,
  getCompletedGrowthCategoriesThisWeek,
  growthCategoryOptionsForCub,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import {
  filterTasksForCubWeekView,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CubRoutinesPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubAssignmentsPage({ params }: CubRoutinesPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [routinesView, tasks, completedGrowth, availableGrowth] =
    await Promise.all([
      getCubRoutinesView(familyId, cub.id),
      db.task.findMany({
        where: { familyId, cubId: cub.id },
        include: {
          focusBlocks: { select: { durationMinutes: true } },
        },
      }),
      getCompletedGrowthCategoriesThisWeek(cub.id),
      getAvailableGrowthCategoriesForCub(cub),
    ]);

  const { dueToday, upcoming } = routinesView;
  const requiredGrowth = parseRequiredGrowthCategories(cub);
  const focusGrowth = {
    availableGrowthAreas: growthCategoryOptionsForCub(cub).filter((option) =>
      availableGrowth.includes(option.value),
    ),
    weekProgressLabel: formatGrowthWeekProgress(completedGrowth, requiredGrowth),
  };

  const assignmentTasks = sortTasksByUrgency(
    filterTasksForCubWeekView(tasks, weekStartsOn),
  );

  const activeFocusTasks = assignmentTasks
    .filter(
      (task) =>
        task.status === "IN_PROGRESS" && task.focusSessionStartedAt !== null,
    )
    .map((task) => ({
      id: task.id,
      title: task.title,
      focusSessionStartedAt: task.focusSessionStartedAt!.toISOString(),
    }));

  const hasRoutines = dueToday.length > 0 || upcoming.length > 0;
  const isEmpty = !hasRoutines && assignmentTasks.length === 0;

  return (
    <div id="assignments" className="scroll-mt-24 space-y-5">
      <MissionHashScroll />
      <CubKidHero
        title="Quest Board"
        subtitle="Routines and one-time tasks — your daily adventure log!"
        emoji={CUB_PAGE_EMOJI.assignments}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      {isEmpty ? (
        <EmptyState
          title="Nothing assigned yet"
          description="When your parent sets up routines or tasks, they will show up here."
        />
      ) : (
        <>
          <section className="space-y-3">
            <CubKidSectionHeader
              title="Routines"
              subtitle="Repeating habits — check in when they're due."
            />

            {dueToday.length > 0 ? (
              <CubKidPanel variant="violet" contentClassName="space-y-3">
                <p className={cubKidSectionEyebrow}>🔄 Due now</p>
                <ul className="space-y-2">
                  {dueToday.map((routine) => (
                    <li key={routine.id}>
                      <Link href={`/cub/${cubId}/challenges/${routine.id}`}>
                        <div
                          className={cn(
                            cubKidGameCard,
                            "space-y-2 border-[3px] bg-gradient-to-br p-4",
                            KID_EARN_CARD.routine.border,
                            KID_EARN_CARD.routine.accent,
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-black text-kid-ink">
                              {routine.title}
                            </p>
                            {routine.logStatus ? (
                              <ChallengeProgressBadge
                                status={routine.logStatus}
                              />
                            ) : (
                              <span className="text-xs font-black text-kid-purple">
                                Ready to Play
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-kid-ink-muted">
                            {formatChallengeInterval(
                              routine.intervalType,
                              routine.intervalConfig,
                            )}
                            {routine.intervalLabel
                              ? ` · ${routine.intervalLabel}`
                              : ""}
                          </p>
                          <p className="text-xs font-black uppercase text-kid-blue">
                            Check in →
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CubKidPanel>
            ) : (
              <p className="text-sm text-kid-ink-muted">No routines due right now — nice work!</p>
            )}

            <CubUpcomingRoutinesSection cubId={cubId} routines={upcoming} />
          </section>

          <CubTasksQuestSection
            cubId={cubId}
            tasks={assignmentTasks}
            focusGrowth={focusGrowth}
          />
        </>
      )}

      <ActiveFocusTimersBanner
        cubName={cub.displayName}
        tasks={activeFocusTasks}
      />
    </div>
  );
}
