import Link from "next/link";
import { ActionTile } from "@/components/ui/action-tile";
import {
  CalendarIcon,
  CubDeviceIcon,
  HomeIcon,
  StarIcon,
  TemplateIcon,
} from "@/components/quick-link-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubCard } from "@/components/cub-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CubColorDot } from "@/components/cub-color-dot";
import { GuardianNudgesSection } from "@/components/guardian-nudges-section";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatMinutes } from "@/lib/ledger-labels";
import { getCubRewardSummary } from "@/lib/rewards";
import {
  formatWeekLabel,
  formatWeekParam,
  getWeekStart,
} from "@/lib/council-day";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { sortTasksByUrgency } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getTodayNextAction } from "@/lib/today-next-action";
import { getHouseholdWeeklyProgress } from "@/lib/weekly-progress";
import { cubAccentClassNames } from "@/lib/cub-colors";
import {
  ensureGuardianNudgePreferences,
  getActiveGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
import { isWithinQuietHours } from "@/lib/guardian-nudges/quiet-hours";
import { countSubmittedChallengeLogs } from "@/lib/cub-routines";
import { redirect } from "next/navigation";

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

  const [
    pendingTaskReview,
    pendingChallengeReview,
    sentBackCount,
    activeTasks,
    councilDaySession,
    focusInProgress,
    guardianNudgePrefs,
    guardianNudges,
  ] = await Promise.all([
    db.task.count({
      where: { familyId: family.id, status: "SUBMITTED" },
    }),
    countSubmittedChallengeLogs(family.id),
    db.task.count({
      where: { familyId: family.id, status: "SENT_BACK" },
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
          select: { conductedAt: true, id: true },
        })
      : Promise.resolve(null),
    db.task.findFirst({
      where: {
        familyId: family.id,
        status: "IN_PROGRESS",
        focusSessionStartedAt: { not: null },
      },
      select: { id: true, title: true, cubId: true },
      orderBy: { focusSessionStartedAt: "desc" },
    }),
    ensureGuardianNudgePreferences(family.id),
    getActiveGuardianNudgesForFamily(family.id),
  ]);

  const pendingReview = pendingTaskReview + pendingChallengeReview;

  const sortedActiveTasks = sortTasksByUrgency(activeTasks).slice(0, 5);
  const inProgressCount = activeTasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "CLAIMED",
  ).length;

  const cubRewardSummaries = await Promise.all(
    family.cubs.map(async (cub) => {
      const [summary, activeCount, assignedCount] = await Promise.all([
        getCubRewardSummary(cub),
        db.task.count({
          where: {
            familyId: family.id,
            cubId: cub.id,
            status: { in: ["CLAIMED", "IN_PROGRESS", "SENT_BACK"] },
          },
        }),
        db.task.count({
          where: { familyId: family.id, cubId: cub.id },
        }),
      ]);
      return { cub, summary, activeCount, assignedCount };
    }),
  );

  const weeklyProgress =
    family.cubs.length > 0
      ? await getHouseholdWeeklyProgress(
          family.id,
          family.cubs,
          weekStartsOn,
        )
      : null;

  const totalPhoneToday = cubRewardSummaries.reduce(
    (sum, row) => sum + row.summary.phoneMinutesAvailableToday,
    0,
  );
  const totalFocusThisWeek = weeklyProgress?.householdTotals.focusMinutes ?? 0;

  const nextAction = getTodayNextAction({
    pendingReview,
    cubsCount: family.cubs.length,
    activeTasksCount: activeTasks.length,
    sentBackCount,
    inProgressWithFocus: focusInProgress
      ? {
          title: focusInProgress.title,
          href: focusInProgress.cubId
            ? `/dashboard/cubs/${focusInProgress.cubId}/tasks`
            : `/dashboard/tasks/${focusInProgress.id}`,
        }
      : null,
    familyDayPending:
      family.cubs.length > 0 && !councilDaySession?.conductedAt && !councilDaySession?.id,
    familyDayInProgress:
      Boolean(councilDaySession?.id) && !councilDaySession?.conductedAt,
    weekQuery,
  });

  const greeting = session.user.name
    ? `Welcome back, ${session.user.name.split(" ")[0]}`
    : "Welcome back";
  const quietHoursActive = isWithinQuietHours(guardianNudgePrefs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Today's Code · ${weekLabel}`}
      />
      <p className="-mt-4 text-sm text-zinc-500">{greeting}</p>

      <GuardianNudgesSection
        nudges={guardianNudges}
        hiddenByQuietHours={quietHoursActive}
      />

      <Card
        variant={nextAction.priority === "urgent" ? "accent" : "default"}
        className="space-y-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Next up
          </p>
          <h2 className="mt-1 text-xl font-bold text-zinc-50">
            {nextAction.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {nextAction.description}
          </p>
        </div>
        <Link href={nextAction.href}>
          <Button fullWidth size="lg">
            {nextAction.buttonLabel}
          </Button>
        </Link>
      </Card>

      {family.cubs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Needs review"
            value={String(pendingReview)}
            detail={pendingReview > 0 ? "Waiting for you" : "All caught up"}
            highlight={pendingReview > 0 ? "amber" : undefined}
          />
          <StatCard
            label="Active tasks"
            value={String(inProgressCount)}
            detail="Claimed or in progress"
          />
          <StatCard
            label="Phone time today"
            value={formatMinutes(totalPhoneToday)}
            detail="Available across Cubs"
          />
          <StatCard
            label="Focus this week"
            value={`${totalFocusThisWeek} min`}
            detail="Logged focus blocks"
          />
        </div>
      ) : null}

      {sortedActiveTasks.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Active now</h2>
            <Link
              href="/dashboard/tasks#active"
              className="text-sm font-medium text-amber-500"
            >
              All tasks →
            </Link>
          </div>
          <ul className="space-y-3">
            {sortedActiveTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className={`block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 ${cubAccentClassNames(task.cub?.id, { border: true })}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-100">
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <TaskScheduleDisplay task={task} compact className="mt-1" />
                  {task.cub ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-400">
                      <CubColorDot cubId={task.cub.id} />
                      {task.cub.displayName}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {family.cubs.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Your Cubs</h2>
            <Link
              href="/dashboard/cubs"
              className="text-sm font-medium text-amber-500"
            >
              All Cubs →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cubRewardSummaries.map(
              ({ cub, summary, activeCount, assignedCount }) => (
                <CubCard
                  key={cub.id}
                  cub={cub}
                  assignedCount={assignedCount}
                  activeCount={activeCount}
                  rewards={summary}
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Quick links</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Shortcuts to Cub view, weekly rhythm, and household tools.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {family.cubs.length === 1 ? (
            <ActionTile
              href={`/cub/${family.cubs[0]!.id}`}
              label={`${family.cubs[0]!.displayName}'s view`}
              description="Hand device to Cub"
              accent="violet"
              icon={<CubDeviceIcon className="h-5 w-5" />}
            />
          ) : family.cubs.length > 1 ? (
            <ActionTile
              href="/cub"
              label="Cub view"
              description="Pick who is using the device"
              accent="violet"
              icon={<CubDeviceIcon className="h-5 w-5" />}
            />
          ) : null}
          <ActionTile
            href={`/dashboard/week?week=${weekQuery}`}
            label="This week"
            description={
              weeklyProgress
                ? `${weeklyProgress.householdTotals.completedTasks} tasks approved`
                : weekLabel
            }
            accent="amber"
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          {family.cubs.length > 0 ? (
            <ActionTile
              href={`/dashboard/family-day?week=${weekQuery}`}
              label={FAMILY_DAY_LABEL}
              description={
                councilDaySession?.conductedAt
                  ? "Completed this week"
                  : "Weekly reflection"
              }
              accent="sky"
              icon={<HomeIcon className="h-5 w-5" />}
            />
          ) : null}
          <ActionTile
            href="/dashboard/rewards"
            label="Rewards"
            description="Redeem Focus Tokens"
            accent="emerald"
            icon={<StarIcon className="h-5 w-5" />}
          />
          <ActionTile
            href="/dashboard/tasks/templates"
            label="Task templates"
            description="Reusable household tasks"
            accent="zinc"
            icon={<TemplateIcon className="h-5 w-5" />}
          />
        </div>
      </section>
    </div>
  );
}
