import Link from "next/link";
import { CubLedgerTimeline } from "@/components/cub-ledger-history";
import { WeeklyProgressDashboard } from "@/components/weekly-progress-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubColorLegend } from "@/components/cub-color-legend";
import { CubColorBadge, CubColorDot } from "@/components/cub-color-dot";
import { TaskScheduleBadge, TaskScheduleDisplay } from "@/components/task-schedule-display";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { formatAgeBand } from "@/lib/age-band-defaults";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatMinutes } from "@/lib/ledger-labels";
import { getCubRewardSummary } from "@/lib/rewards";
import { getCubLedgerEntries } from "@/lib/cub-ledger";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import {
  formatWeekLabel,
  formatWeekParam,
  getWeekStart,
} from "@/lib/council-day";
import {
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { redirect } from "next/navigation";
import { getHouseholdWeeklyProgress } from "@/lib/weekly-progress";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const weekStartsOn = getWeekStart();
  const weekLabel = formatWeekLabel(weekStartsOn);
  const weekQuery = formatWeekParam(weekStartsOn);

  const [pendingReview, taskCountsByCub, activeTasks, councilDaySession] =
    await Promise.all([
    db.task.count({
      where: { familyId: family.id, status: "SUBMITTED" },
    }),
    db.task.groupBy({
      by: ["cubId"],
      where: { familyId: family.id, cubId: { not: null } },
      _count: { _all: true },
    }),
    db.task.findMany({
      where: {
        familyId: family.id,
        cubId: { not: null },
        status: { in: ACTIVE_CUB_STATUSES },
      },
      include: { cub: true },
      orderBy: [{ claimedAt: "desc" }],
    }),
    family.cubs.length > 0
      ? db.councilDaySession.findUnique({
          where: {
            familyId_weekStartsOn: {
              familyId: family.id,
              weekStartsOn,
            },
          },
          select: { conductedAt: true },
        })
      : Promise.resolve(null),
  ]);

  const sortedActiveTasks = sortTasksByUrgency(activeTasks);

  const assignedCountByCubId = new Map(
    taskCountsByCub.map((row) => [row.cubId!, row._count._all]),
  );

  const cubRewardSummaries = await Promise.all(
    family.cubs.map(async (cub) => ({
      cubId: cub.id,
      summary: await getCubRewardSummary(cub),
      ledgerEntries: await getCubLedgerEntries(cub.id, { limit: 12 }),
    })),
  );
  const rewardSummaryByCubId = new Map(
    cubRewardSummaries.map((row) => [row.cubId, row.summary]),
  );
  const ledgerEntriesByCubId = new Map(
    cubRewardSummaries.map((row) => [row.cubId, row.ledgerEntries]),
  );

  const weeklyProgress =
    family.cubs.length > 0
      ? await getHouseholdWeeklyProgress(
          family.id,
          family.cubs,
          weekStartsOn,
        )
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Household overview</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome{session.user.name ? `, ${session.user.name}` : ""}. Run the
          task loop: assign → focus → submit → review.
        </p>
        {family.cubs.length > 0 ? (
          <div className="mt-3">
            <CubColorLegend cubs={family.cubs} />
          </div>
        ) : null}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/60 dark:bg-amber-950/20">
        <div>
          <h2 className="text-lg font-semibold">Task loop</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {pendingReview > 0
              ? `${pendingReview} task${pendingReview === 1 ? "" : "s"} waiting for your review.`
              : "No tasks waiting for review."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tasks">
            <Button variant="secondary">Task Board</Button>
          </Link>
          <Link href="/dashboard/tasks/review">
            <Button>Review queue</Button>
          </Link>
        </div>
      </Card>

      {weeklyProgress ? (
        <WeeklyProgressDashboard
          progress={weeklyProgress}
          weekQuery={weekQuery}
          compact
        />
      ) : null}

      {family.cubs.length > 0 ? (
        <Card
          className={
            councilDaySession?.conductedAt
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
              : "border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20"
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{FAMILY_DAY_LABEL}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {councilDaySession?.conductedAt
                  ? `Completed for ${weekLabel}.`
                  : councilDaySession
                    ? `Started for ${weekLabel} — finish reflections and credit bonuses.`
                    : `Weekly check-in for ${weekLabel} is ready when you are.`}
              </p>
            </div>
            <Link
              href={`/dashboard/family-day?week=${formatWeekParam(weekStartsOn)}`}
            >
              <Button variant={councilDaySession?.conductedAt ? "secondary" : "primary"}>
                {councilDaySession?.conductedAt
                  ? `View ${FAMILY_DAY_LABEL}`
                  : councilDaySession
                    ? `Continue ${FAMILY_DAY_LABEL}`
                    : `Run ${FAMILY_DAY_LABEL}`}
              </Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Active tasks</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Assigned work across the household, with due dates and days left or
              overdue.
            </p>
          </div>
          <Link href="/dashboard/tasks">
            <Button variant="secondary">Task Board</Button>
          </Link>
        </div>

        {sortedActiveTasks.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No active tasks right now. Assign work from the task board or a
            Cub&apos;s task page.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sortedActiveTasks.map((task) => (
              <li
                key={task.id}
                className={`rounded-lg border border-zinc-200 px-3 py-3 transition dark:border-zinc-800 ${cubAccentClassNames(task.cub?.id, { border: true, rowHover: true })}`}
              >
                <Link href={`/dashboard/tasks/${task.id}`} className="block">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    <TaskStatusBadge status={task.status} />
                    <TaskScheduleBadge task={task} />
                  </div>
                  <TaskScheduleDisplay task={task} compact className="mt-1" />
                </Link>
                {task.cub ? (
                  <p className="mt-2 text-sm">
                    <CubColorBadge
                      cubId={task.cub.id}
                      displayName={task.cub.displayName}
                    />
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Family</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Name" value={family.name ?? "Not set"} />
            <Row
              label="Daily phone cap"
              value={`${family.dailyPhoneCapMinutes} min`}
            />
            <Row
              label="Weekend bank cap"
              value={`${family.weekendBankCapMinutes} min`}
            />
            <Row
              label="Exchange rate"
              value={`${family.exchangeFocusMinutes} min focus → ${family.exchangePhoneMinutes} min phone`}
            />
          </dl>
          <Link href="/dashboard/family/settings" className="mt-4 inline-block">
            <Button variant="secondary">Edit household rules</Button>
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Cubs</h2>
            <Link href="/dashboard/cubs/new">
              <Button>Add Cub</Button>
            </Link>
          </div>

          {family.cubs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Add a Cub before assigning tasks from the board.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {family.cubs.map((cub) => {
                const assignedCount = assignedCountByCubId.get(cub.id) ?? 0;
                const rewards = rewardSummaryByCubId.get(cub.id);

                return (
                <li
                  key={cub.id}
                  className={`flex items-start justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 transition dark:border-zinc-800 ${cubAccentClassNames(cub.id, { border: true, rowHover: true })}`}
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/cubs/${cub.id}/tasks`}
                      className="block"
                    >
                      <p className="inline-flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <CubColorDot cubId={cub.id} />
                        {cub.displayName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {formatAgeBand(cub.ageBand)}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {assignedCount === 0
                          ? "No tasks assigned"
                          : `${assignedCount} task${assignedCount === 1 ? "" : "s"} assigned`}
                      </p>
                      {rewards ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          {rewards.totalXp} XP · {rewards.totalFocusTokens} tokens ·{" "}
                          {formatMinutes(rewards.phoneMinutesAvailableToday)} phone today ·{" "}
                          {rewards.rank.current.name}
                        </p>
                      ) : null}
                    </Link>
                    <div className="mt-2">
                      <CubLedgerTimeline
                        cubId={cub.id}
                        entries={ledgerEntriesByCubId.get(cub.id) ?? []}
                        emptyMessage="No task history yet."
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link href={`/dashboard/cubs/${cub.id}/tasks#assign-task`}>
                      <Button
                        variant="secondary"
                        className="rounded-md px-2.5 py-1 text-xs"
                      >
                        Assign task
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/cubs/${cub.id}/progress`}
                      className="text-sm font-medium text-amber-700"
                    >
                      Progress
                    </Link>
                    <Link
                      href={`/dashboard/cubs/${cub.id}/tasks`}
                      className="text-sm font-medium text-amber-700"
                    >
                      Tasks
                    </Link>
                    <Link
                      href={`/dashboard/cubs/${cub.id}/edit`}
                      className="text-sm font-medium text-zinc-500"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
