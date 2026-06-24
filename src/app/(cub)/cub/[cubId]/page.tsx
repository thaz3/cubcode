import Link from "next/link";
import { ActiveFocusTimersBanner } from "@/components/active-focus-timers-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubNextAction } from "@/lib/cub-next-action";
import { formatMinutes } from "@/lib/ledger-labels";
import { getCubRewardSummary } from "@/lib/rewards";
import { sortTasksByUrgency, isTaskUrgent } from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
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

  const [tasks, summary] = await Promise.all([
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
      },
    }),
    getCubRewardSummary(cub),
  ]);

  const nextAction = getCubNextAction(tasks, cubId);
  const urgent = sortTasksByUrgency(
    await db.task.findMany({
      where: { familyId, cubId: cub.id },
    }),
  ).filter((t) => isTaskUrgent(t) && ACTIVE_CUB_STATUSES.includes(t.status));

  const activeFocus = tasks
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

      {urgent.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-100">Do now</h2>
          <ul className="space-y-2">
            {urgent.slice(0, 3).map((task) => (
              <li key={task.id}>
                <Link href={`/cub/${cubId}/tasks`}>
                  <Card variant="interactive" className="flex items-center justify-between gap-3 py-4">
                    <span className="font-medium text-zinc-100">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
