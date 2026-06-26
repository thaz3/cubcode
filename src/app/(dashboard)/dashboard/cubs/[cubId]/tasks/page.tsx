import Link from "next/link";
import { AssignTaskToCubPanel } from "@/components/assign-task-to-cub-panel";
import { CubColorBadge } from "@/components/cub-color-dot";
import { RequestSessionTimer } from "@/components/request-session-timer";
import { ParentFocusSessionControls } from "@/components/parent-focus-session-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { ParentBonusXpForm } from "@/components/parent-bonus-xp-form";
import { AssignmentManageActions } from "@/components/assignment-manage-actions";
import { StartTaskForm } from "@/components/start-task-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { auth } from "@/lib/auth";
import type { SupervisionLevel } from "@/generated/prisma/client";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import {
  formatTaskCategory,
  growthCategoryShortLabel,
} from "@/lib/task-categories";
import { db } from "@/lib/db";
import {
  formatGrowthWeekProgress,
  getAvailableGrowthCategoriesForCub,
  getCompletedGrowthCategoriesThisWeek,
  growthCategoryOptionsForCub,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { getFamilyForUser } from "@/lib/session";
import {
  getTaskScheduleSummary,
  isTaskOverdue,
  isTaskUrgent,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES, PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";
import { formatTaskRecurrence } from "@/lib/task-recurrence";
import { cn } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

type CubTasksPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubTasksPage({ params }: CubTasksPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const cub = family.cubs.find((c) => c.id === cubId);
  if (!cub) notFound();

  const [tasks, recentParentBonuses, libraryTasks, completedGrowth, availableGrowth] =
    await Promise.all([
    db.task.findMany({
      where: { familyId: family.id, cubId: cub.id },
      include: {
        focusBlocks: { select: { durationMinutes: true } },
      },
    }),
    db.xpLedgerEntry.findMany({
      where: {
        cubId: cub.id,
        reason: "PARENT_ADJUSTMENT",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        note: true,
        growthCategory: true,
        createdAt: true,
      },
    }),
    db.task.findMany({
      where: { familyId: family.id, status: "AVAILABLE" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        growthCategory: true,
        proofType: true,
      },
    }),
    getCompletedGrowthCategoriesThisWeek(cub.id),
    getAvailableGrowthCategoriesForCub(cub),
  ]);

  const requiredGrowth = parseRequiredGrowthCategories(cub);
  const focusGrowth = {
    availableGrowthAreas: growthCategoryOptionsForCub(cub).filter((option) =>
      availableGrowth.includes(option.value),
    ),
    weekProgressLabel: formatGrowthWeekProgress(completedGrowth, requiredGrowth),
  };
  const bonusGrowthOptions = growthCategoryOptionsForCub(cub);

  const activeTasks = sortTasksByUrgency(
    tasks.filter((task) => ACTIVE_CUB_STATUSES.includes(task.status)),
  );
  const completedCount = tasks.filter((task) =>
    PARENT_CUB_COMPLETED_STATUSES.includes(task.status),
  ).length;
  const urgentTasks = activeTasks.filter((task) => isTaskUrgent(task));

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${cub.displayName} — parent`}
        subtitle="Assign tasks, log focus, and submit on their behalf."
        backHref="/dashboard/cubs"
        backLabel="Cubs"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/cub/${cub.id}`}>
              <Button variant="secondary" size="lg">
                Cub view
              </Button>
            </Link>
            <Link href={`/dashboard/cubs/${cub.id}/tasks#assign-task`}>
              <Button size="lg">Assign task</Button>
            </Link>
          </div>
        }
      />
      <CubColorBadge cubId={cub.id} displayName={cub.displayName} />

      <Card
        variant="accent"
        className={cn(
          cubAccentClassNames(cub.id, { border: true }),
          "ring-1 ring-cub-gold/30",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
              <h2 className="mt-2 text-lg font-semibold text-cub-off-white">
                {cub.displayName}&apos;s settings
              </h2>
              <p className="mt-1 text-sm text-cub-muted">
                Default rewards for new tasks and household limits for this Cub.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CubSettingsStat
                label="Focus"
                value={`${cub.focusMinutesEarned} min`}
              />
              <CubSettingsStat
                label="Phone"
                value={`${cub.phoneMinutesEarned} min`}
              />
              <CubSettingsStat label="XP" value={String(cub.xpEarned)} />
              <CubSettingsStat
                label="Tokens"
                value={String(cub.focusTokensEarned)}
              />
            </div>

            <div className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted/25 px-3 py-2.5 text-sm text-cub-off-white">
              <p className="font-medium text-cub-gold-light">Phone limits</p>
              <p className="mt-1 text-cub-off-white/90">
                Daily cap {cub.dailyPhoneCapMinutes} min · Weekend bank{" "}
                {cub.weekendBankCapMinutes} min
              </p>
              <p className="mt-1 text-cub-muted">
                {formatSupervision(cub.supervisionLevel)}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/cubs/${cub.id}/edit`}
            className="shrink-0 sm:pt-1"
          >
            <Button variant="reward" fullWidth className="sm:w-auto">
              Edit Cub settings
            </Button>
          </Link>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Assigned tasks</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {activeTasks.length === 0
                ? "Nothing active right now."
                : `${activeTasks.length} active task${activeTasks.length === 1 ? "" : "s"} for ${cub.displayName}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {completedCount > 0 ? (
              <Link href={`/dashboard/cubs/${cub.id}/tasks/completed`}>
                <Button variant="secondary" className="rounded-md px-2.5 py-1 text-xs">
                  Completed ({completedCount})
                </Button>
              </Link>
            ) : null}
            <Link href={`/dashboard/cubs/${cub.id}/tasks#assign-task`}>
              <Button variant="secondary" className="rounded-md px-2.5 py-1 text-xs">
                Assign task
              </Button>
            </Link>
          </div>
        </div>

        {urgentTasks.length > 0 ? (
        <Card
          className={
            urgentTasks.some((task) => isTaskOverdue(task))
              ? "border-red-300 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40"
              : "border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/40"
          }
        >
          <h2
            className={
              urgentTasks.some((task) => isTaskOverdue(task))
                ? "text-lg font-semibold text-red-950 dark:text-red-100"
                : "text-lg font-semibold text-amber-950 dark:text-amber-100"
            }
          >
            Do now
          </h2>
          <p
            className={
              urgentTasks.some((task) => isTaskOverdue(task))
                ? "mt-1 text-sm text-red-900/80 dark:text-red-200/80"
                : "mt-1 text-sm text-amber-900/80 dark:text-amber-200/80"
            }
          >
            {cub.displayName} should see these first — due soon or overdue.
            {urgentTasks.some((task) => isTaskOverdue(task))
              ? " Overdue tasks earn half rewards if submitted late."
              : null}
          </p>
          <ul className="mt-3 space-y-2">
            {urgentTasks.map((task) => {
              const schedule = getTaskScheduleSummary(task);
              const overdue = isTaskOverdue(task);
              return (
                <li key={task.id}>
                  <Link
                    href={`/dashboard/tasks/${task.id}`}
                    className={
                      overdue
                        ? "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-white/80 px-3 py-2 hover:border-red-400 dark:border-red-900 dark:bg-cub-ebony/60"
                        : "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 hover:border-amber-400 dark:border-amber-900 dark:bg-cub-ebony/60"
                    }
                  >
                    <span className="font-medium">{task.title}</span>
                    {schedule.timingLabel ? (
                      <span
                        className={
                          overdue
                            ? "text-sm font-medium text-red-800 dark:text-red-300"
                            : "text-sm font-medium text-amber-800 dark:text-amber-300"
                        }
                      >
                        {overdue ? "Urgent · " : null}
                        {schedule.timingLabel}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        ) : null}

        {activeTasks.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-500">
              Assign a task from your library below.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {activeTasks.map((task) => {
              const focusMinutes = task.focusBlocks.reduce(
                (sum, block) => sum + block.durationMinutes,
                0,
              );
              const isTimerRunning = Boolean(
                task.status === "IN_PROGRESS" && task.focusSessionStartedAt,
              );

              return (
              <Card
                key={task.id}
                className={cn(
                  "p-4",
                  cubAccentClassNames(cub.id, {
                    border: true,
                    cardTint: isTimerRunning,
                  }),
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="font-semibold hover:text-amber-700"
                      >
                        {task.title}
                      </Link>
                      <StatusBadge status={task.status} />
                    </div>
                    <TaskScheduleDisplay task={task} inline className="mt-0.5" />
                    {isTimerRunning && task.focusSessionStartedAt ? (
                      <RequestSessionTimer
                        startedAt={task.focusSessionStartedAt.toISOString()}
                        label="Request timer"
                        inline
                        className="mt-1"
                      />
                    ) : null}
                    {task.category === "FOCUS_BLOCK" &&
                    (task.status === "CLAIMED" || task.status === "IN_PROGRESS") ? (
                      <ParentFocusSessionControls
                        taskId={task.id}
                        cubName={cub.displayName}
                        focusSessionStartedAt={
                          task.focusSessionStartedAt?.toISOString() ?? null
                        }
                        canEnd
                        compact
                      />
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatTaskCategory(task.category, {
                        subcategory: task.subcategory,
                        growthCategory: task.growthCategory,
                      })}{" "}
                      · {formatProofType(task.proofType)} · {formatTaskRewards(task)}
                      {formatTaskRecurrence(task.recurrence)
                        ? ` · ${formatTaskRecurrence(task.recurrence)}`
                        : ""}
                      {focusMinutes > 0 ? ` · ${focusMinutes} min logged` : ""}
                    </p>
                    {task.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {task.description}
                      </p>
                    ) : null}
                    {task.status === "SENT_BACK" && task.reviewNote ? (
                      <p className="mt-1 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                        Parent note: {task.reviewNote}
                      </p>
                    ) : null}
                  </div>
                  <AssignmentManageActions
                    taskId={task.id}
                    status={task.status}
                    size="sm"
                  />
                </div>

                {(task.status === "CLAIMED" || task.status === "SENT_BACK") && (
                  <div className="mt-3">
                    <StartTaskForm
                      taskId={task.id}
                      isFocusBlock={task.category === "FOCUS_BLOCK"}
                      isResubmit={task.status === "SENT_BACK"}
                      availableGrowthAreas={
                        task.category === "FOCUS_BLOCK"
                          ? focusGrowth.availableGrowthAreas
                          : []
                      }
                      weekProgressLabel={
                        task.category === "FOCUS_BLOCK"
                          ? focusGrowth.weekProgressLabel
                          : undefined
                      }
                    />
                  </div>
                )}

                {task.status === "IN_PROGRESS" && (
                  <p className="mt-3 text-xs text-zinc-500">
                    {cub.displayName} is working on this. They submit from{" "}
                    <Link href={`/cub/${cub.id}/tasks`} className="font-medium text-cub-gold">
                      Cub view
                    </Link>
                    , or you can{" "}
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="font-medium text-cub-gold"
                    >
                      submit on their behalf
                    </Link>
                    .
                  </p>
                )}

                {task.status === "SUBMITTED" ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    Waiting for parent review.
                  </p>
                ) : null}
              </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card id="assign-task" className="scroll-mt-8">
        <h2 className="text-lg font-semibold">Assign work</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Create a one-time task or routine, or assign from your household task
          library for {cub.displayName}.
        </p>
        <div className="mt-4">
          <AssignTaskToCubPanel
            cubId={cub.id}
            cubName={cub.displayName}
            libraryTasks={libraryTasks}
            cubs={family.cubs}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Offline behavior bonus</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Award extra XP when {cub.displayName} shows strong offline behavior.
          Counts toward their weekly growth chart.
        </p>
        {recentParentBonuses.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No bonuses awarded yet.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {recentParentBonuses.map((bonus) => (
              <li key={bonus.id}>
                +{bonus.amount} XP
                {bonus.growthCategory
                  ? ` · ${growthCategoryShortLabel(bonus.growthCategory)}`
                  : ""}{" "}
                · {bonus.createdAt.toLocaleString()}
                {bonus.note ? ` · ${bonus.note}` : ""}
              </li>
            ))}
          </ul>
        )}
        <ParentBonusXpForm cubId={cub.id} growthOptions={bonusGrowthOptions} />
      </Card>
    </div>
  );
}

function CubSettingsStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cub-gold/35 bg-cub-ebony/50 px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-cub-gold-light">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-snug text-cub-off-white">
        {value}
      </p>
    </div>
  );
}

function formatSupervision(level: SupervisionLevel): string {
  const labels: Record<SupervisionLevel, string> = {
    DIRECT: "Direct supervision",
    NEARBY: "Nearby supervision",
    INDEPENDENT: "Independent check-ins",
  };
  return labels[level];
}
