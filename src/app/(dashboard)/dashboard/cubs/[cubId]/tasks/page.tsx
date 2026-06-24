import Link from "next/link";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { AssignTaskToCubPanel } from "@/components/assign-task-to-cub-panel";
import { CubColorBadge } from "@/components/cub-color-dot";
import { FocusSessionTimer } from "@/components/focus-session-timer";
import { StatusBadge } from "@/components/ui/status-badge";
import { FocusBlockForm, TaskSubmitForm } from "@/components/task-workflow-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { startTaskAction } from "@/lib/actions/tasks";
import { auth } from "@/lib/auth";
import type { SupervisionLevel } from "@/generated/prisma/client";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import {
  formatTaskCategory,
  GROWTH_CATEGORY_LABELS,
} from "@/lib/task-categories";
import { db } from "@/lib/db";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { getFamilyForUser } from "@/lib/session";
import {
  getTaskScheduleSummary,
  isTaskOverdue,
  isTaskUrgent,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { isTaskEditable } from "@/lib/task-transitions";
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

  const [tasks, focusBlocks, availableTasks, templates] = await Promise.all([
    db.task.findMany({
      where: { familyId: family.id, cubId: cub.id },
      include: {
        focusBlocks: { select: { durationMinutes: true } },
      },
    }),
    db.focusBlockLog.findMany({
      where: { cubId: cub.id },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    db.task.findMany({
      where: { familyId: family.id, status: "AVAILABLE" },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.taskTemplate.findMany({
      where: { familyId: family.id, isActive: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const sortedTasks = sortTasksByUrgency(tasks);
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

      <ActiveFocusTimersBanner
        cubName={cub.displayName}
        tasks={activeFocusTasks}
      />

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
                        ? "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-white/80 px-3 py-2 hover:border-red-400 dark:border-red-900 dark:bg-zinc-950/60"
                        : "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 hover:border-amber-400 dark:border-amber-900 dark:bg-zinc-950/60"
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Assigned tasks</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {tasks.length === 0
                ? "Nothing assigned yet."
                : `${tasks.length} task${tasks.length === 1 ? "" : "s"} assigned to ${cub.displayName}`}
            </p>
          </div>
          <Link href={`/dashboard/cubs/${cub.id}/tasks#assign-task`}>
            <Button variant="secondary" className="rounded-md px-2.5 py-1 text-xs">
              Assign task
            </Button>
          </Link>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-500">
              Assign a task from the board or a template below.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedTasks.map((task) => {
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
                className={cubAccentClassNames(cub.id, {
                  border: true,
                  cardTint: isTimerRunning,
                })}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="text-lg font-semibold hover:text-amber-700"
                      >
                        {task.title}
                      </Link>
                      <StatusBadge status={task.status} />
                    <TaskScheduleBadge task={task} />
                    </div>
                    <TaskScheduleDisplay task={task} className="mt-1" />
                    {isTimerRunning && task.focusSessionStartedAt ? (
                      <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 dark:border-indigo-900 dark:bg-indigo-950/40">
                        <FocusSessionTimer
                          startedAt={task.focusSessionStartedAt.toISOString()}
                          label="Focus timer running"
                        />
                      </div>
                    ) : null}
                    {focusMinutes > 0 ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        {focusMinutes} min focus logged total
                        {task.status === "SENT_BACK"
                          ? " · start again to log redo time on submit"
                          : ""}
                      </p>
                    ) : null}
                    {task.description ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {task.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-zinc-500">
                      {formatTaskCategory(task.category, {
                        subcategory: task.subcategory,
                        growthCategory: task.growthCategory,
                      })}{" "}
                      · {formatProofType(task.proofType)} · {formatTaskRewards(task)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Parent approval required to earn rewards.
                    </p>
                    {task.status === "SENT_BACK" && task.reviewNote ? (
                      <p className="mt-2 rounded-lg bg-orange-50 p-2 text-sm text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                        Parent note: {task.reviewNote}
                      </p>
                    ) : null}
                  </div>
                  {isTaskEditable(task.status) ? (
                    <Link href={`/dashboard/tasks/${task.id}/edit`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                  ) : null}
                </div>

                {(task.status === "CLAIMED" || task.status === "SENT_BACK") && (
                  <form
                    action={async () => {
                      "use server";
                      await startTaskAction(task.id);
                    }}
                    className="mt-4"
                  >
                    <Button type="submit" fullWidth size="lg" variant="secondary">
                      {task.status === "SENT_BACK"
                        ? "Start redo — focus timer runs until submit"
                        : "Start task — focus timer runs until submit"}
                    </Button>
                  </form>
                )}

                {task.status === "IN_PROGRESS" && (
                  <TaskSubmitForm task={task} />
                )}

                {["SUBMITTED", "APPROVED", "COMPLETED", "REJECTED"].includes(task.status) ? (
                  <p className="mt-4 text-sm text-zinc-500">
                    {task.status === "SUBMITTED"
                      ? "Waiting for parent review."
                      : task.status === "COMPLETED"
                        ? "Completed — rewards credited."
                        : task.status === "APPROVED"
                          ? "Approved — processing rewards."
                          : "Rejected — create a new task from a template if needed."}
                  </p>
                ) : null}
              </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            This Cub&apos;s settings
          </h2>
          <p>{formatTaskRewards(cub)}</p>
          <p>
            Daily cap {cub.dailyPhoneCapMinutes} min · Weekend bank{" "}
            {cub.weekendBankCapMinutes} min · {formatSupervision(cub.supervisionLevel)}
          </p>
        </div>
        <Link href={`/dashboard/cubs/${cub.id}/edit`}>
          <Button variant="secondary">Edit Cub settings</Button>
        </Link>
      </Card>

      <Card id="assign-task" className="scroll-mt-8">
        <h2 className="text-lg font-semibold">Assign a task</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Create a one-off task, pick from the board, or use a template for{" "}
          {cub.displayName}.
        </p>
        <div className="mt-4">
          <AssignTaskToCubPanel
            cubId={cub.id}
            cubName={cub.displayName}
            availableTasks={availableTasks}
            templates={templates}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Extra focus (optional)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Log focus not tied to a task. Task focus is recorded automatically from
          Start until Submit.
        </p>
        {focusBlocks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">None logged yet.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {focusBlocks.map((block) => (
              <li key={block.id}>
                {block.durationMinutes} min · {block.startedAt.toLocaleString()}
                {block.growthCategory
                  ? ` · ${GROWTH_CATEGORY_LABELS[block.growthCategory].split(" —")[0]}`
                  : ""}
                {block.note ? ` · ${block.note}` : ""}
              </li>
            ))}
          </ul>
        )}
        <FocusBlockForm cubId={cub.id} defaultDurationMinutes={cub.focusMinutesEarned} />
      </Card>
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
