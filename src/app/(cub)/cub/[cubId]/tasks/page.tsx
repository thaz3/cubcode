import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import {
  CubWorkflowTaskCard,
  type FocusGrowthContext,
} from "@/components/cub-workflow-task-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { db } from "@/lib/db";
import {
  formatGrowthWeekProgress,
  getAvailableGrowthCategoriesForCub,
  getCompletedGrowthCategoriesThisWeek,
  growthCategoryOptionsForCub,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import {
  filterTasksForWeek,
  isTaskOverdue,
  isTaskUrgent,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { redirect } from "next/navigation";

type CubTasksPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubModeTasksPage({ params }: CubTasksPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [tasks, completedGrowth, availableGrowth] = await Promise.all([
    db.task.findMany({
      where: { familyId, cubId: cub.id },
      include: {
        focusBlocks: { select: { durationMinutes: true } },
      },
    }),
    getCompletedGrowthCategoriesThisWeek(cub.id),
    getAvailableGrowthCategoriesForCub(cub),
  ]);

  const requiredGrowth = parseRequiredGrowthCategories(cub);
  const focusGrowth: FocusGrowthContext = {
    availableGrowthAreas: growthCategoryOptionsForCub(cub).filter((option) =>
      availableGrowth.includes(option.value),
    ),
    weekProgressLabel: formatGrowthWeekProgress(completedGrowth, requiredGrowth),
  };

  const weekTasks = filterTasksForWeek(tasks, weekStartsOn);
  const sortedTasks = sortTasksByUrgency(weekTasks);
  const urgentTasks = sortedTasks.filter((task) => isTaskUrgent(task));
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My tasks"
        subtitle={`This week · ${formatWeekLabel(weekStartsOn)}. Open instructions, do the work, and submit for parent review.`}
      />

      <ActiveFocusTimersBanner
        cubName={cub.displayName}
        tasks={activeFocusTasks}
      />

      {urgentTasks.length > 0 ? (
        <Card
          variant="accent"
          className={
            urgentTasks.some((task) => isTaskOverdue(task))
              ? "border-red-800/60"
              : undefined
          }
        >
          <h2 className="text-lg font-semibold text-zinc-100">Do these first</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Due soon or overdue — tackle these before anything else.
          </p>
        </Card>
      ) : null}

      {sortedTasks.length === 0 ? (
        <EmptyState
          title="No tasks this week"
          description="Ask your parent to assign something for this week."
        />
      ) : (
        <SwipeCardDeck>
          {sortedTasks.map((task) => (
            <CubWorkflowTaskCard
              key={task.id}
              task={task}
              cubId={cub.id}
              focusGrowth={task.category === "FOCUS_BLOCK" ? focusGrowth : null}
            />
          ))}
        </SwipeCardDeck>
      )}
    </div>
  );
}
