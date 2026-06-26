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
import { GrowthAreasCard } from "@/components/growth-areas-card";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { getCubRewardSummary } from "@/lib/rewards";
import {
  formatWeekLabel,
  formatWeekParam,
  getWeekStart,
} from "@/lib/council-day";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import { sortTasksByUrgency } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getHouseholdWeeklyProgress } from "@/lib/weekly-progress";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { cubSectionTitle } from "@/lib/cub-theme";
import {
  ensureGuardianNudgePreferences,
  getActiveGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
import { isWithinQuietHours } from "@/lib/guardian-nudges/quiet-hours";
import { countSubmittedChallengeLogs } from "@/lib/cub-routines";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
    activeTasks,
    focusInProgressTasks,
    councilDaySession,
    guardianNudgePrefs,
    guardianNudges,
  ] = await Promise.all([
    db.task.count({
      where: { familyId: family.id, status: "SUBMITTED" },
    }),
    countSubmittedChallengeLogs(family.id),
    db.task.findMany({
      where: {
        familyId: family.id,
        cubId: { not: null },
        status: { in: ACTIVE_CUB_STATUSES },
      },
      include: { cub: true },
      orderBy: [{ claimedAt: "desc" }],
    }),
    db.task.findMany({
      where: {
        familyId: family.id,
        status: "IN_PROGRESS",
        focusSessionStartedAt: { not: null },
      },
      select: {
        id: true,
        title: true,
        cubId: true,
        cub: { select: { displayName: true } },
      },
      orderBy: { focusSessionStartedAt: "desc" },
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

  const totalFocusThisWeek = weeklyProgress?.householdTotals.focusMinutes ?? 0;

  const cubGrowthSummaries = await Promise.all(
    family.cubs.map(async (cub) => ({
      cub,
      growth: await getCubGrowthAreaSummary(cub, weekStartsOn),
    })),
  );

  const focusSessionReminders = focusInProgressTasks.map((task) => ({
    id: task.id,
    title: task.title,
    cubId: task.cubId,
    cubName: task.cub?.displayName ?? null,
    href: task.cubId
      ? `/dashboard/cubs/${task.cubId}/tasks`
      : `/dashboard/tasks/${task.id}`,
  }));

  const greeting = session.user.name
    ? `Welcome back, ${session.user.name.split(" ")[0]}`
    : "Welcome back";
  const quietHoursActive = isWithinQuietHours(guardianNudgePrefs);

  const activeSmallRemindersCount =
    guardianNudges.filter((nudge) => nudge.status === "ACTIVE").length +
    focusSessionReminders.length;
  const smallRemindersDetail =
    activeSmallRemindersCount > 0
      ? quietHoursActive
        ? "Some hidden during quiet hours"
        : "Worth a look below"
      : "All caught up";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent's Room"
        subtitle={`Today's Code · ${weekLabel}`}
      />
      <p className="-mt-4 text-sm text-cub-muted">{greeting}</p>

      {family.cubs.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className={cubSectionTitle}>Your Cubs</h2>
            <Link
              href="/dashboard/cubs"
              className="text-sm font-medium text-cub-gold"
            >
              All Cubs →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cubRewardSummaries.map(
              ({ cub, summary, activeCount, assignedCount }) => {
                const growth = cubGrowthSummaries.find(
                  (row) => row.cub.id === cub.id,
                )?.growth;
                return (
                  <div key={cub.id} className="flex flex-col gap-3">
                    <CubCard
                      cub={cub}
                      assignedCount={assignedCount}
                      activeCount={activeCount}
                      rewards={summary}
                    />
                    {growth ? (
                      <GrowthAreasCard
                        variant="mini"
                        summary={growth}
                        cubId={cub.id}
                        cubName={cub.displayName}
                        className={cubAccentClassNames(cub.id, { border: true })}
                      />
                    ) : null}
                  </div>
                );
              },
            )}
          </div>
        </section>
      ) : (
        <Card className="space-y-4">
          <h2 className={cubSectionTitle}>Your Cubs</h2>
          <p className="text-sm text-cub-muted">
            Add a Cub profile to assign tasks and track growth.
          </p>
          <Link href="/dashboard/cubs/new">
            <Button>Add your first Cub</Button>
          </Link>
        </Card>
      )}

      {family.cubs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Needs review"
            value={String(pendingReview)}
            detail={pendingReview > 0 ? "Waiting for you" : "All caught up"}
            highlight="gold"
          />
          <StatCard
            label="Active tasks"
            value={String(inProgressCount)}
            detail="Claimed or in progress"
            highlight="green"
          />
          <StatCard
            label={SMALL_REMINDERS_LABEL}
            value={String(activeSmallRemindersCount)}
            detail={smallRemindersDetail}
            highlight={activeSmallRemindersCount > 0 ? "red" : "gold"}
          />
          <StatCard
            label="Focus this week"
            value={`${totalFocusThisWeek} min`}
            detail="Logged focus blocks"
            highlight="green"
          />
        </div>
      ) : null}

      {sortedActiveTasks.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className={cubSectionTitle}>Active now</h2>
            <Link
              href="/dashboard/tasks#active"
              className="text-sm font-medium text-cub-gold"
            >
              All tasks →
            </Link>
          </div>
          <ul className="space-y-3">
            {sortedActiveTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className={cn(
                    "block rounded-2xl border p-4 shadow-sm transition hover:shadow-md",
                    task.status === "IN_PROGRESS"
                      ? "border-cub-green-bright/35 cub-card-green hover:border-cub-green-bright/55"
                      : task.status === "SENT_BACK"
                        ? "border-cub-gold/35 cub-card-gold hover:border-cub-gold/55"
                        : "border-cub-charcoal/80 cub-card-surface hover:border-cub-gold/30",
                    cubAccentClassNames(task.cub?.id, { border: true }),
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-cub-off-white">
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <TaskScheduleDisplay task={task} compact className="mt-1" />
                  {task.cub ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-cub-muted">
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

      <GuardianNudgesSection
        nudges={guardianNudges}
        focusSessions={focusSessionReminders}
        hiddenByQuietHours={quietHoursActive}
      />

      <section className="space-y-3">
        <div>
          <h2 className={cubSectionTitle}>Quick links</h2>
          <p className="mt-1 text-sm text-cub-muted">
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
            label="Training Packs"
            description="Reusable tasks and routines"
            accent="zinc"
            icon={<TemplateIcon className="h-5 w-5" />}
          />
        </div>
      </section>
    </div>
  );
}
