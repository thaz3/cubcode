import Link from "next/link";
import { CubColorBadge } from "@/components/cub-color-dot";
import { CubLedgerTimeline } from "@/components/cub-ledger-history";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { LEGACY_WEEKLY_LABEL } from "@/lib/legacy-task-templates";
import { SUMMER_LITE_LABEL } from "@/lib/summer-task-templates";
import { formatMinutes } from "@/lib/ledger-labels";
import { cubAccentClassNames } from "@/lib/cub-colors";
import type { HouseholdWeeklyProgress } from "@/lib/weekly-progress";
import { cn } from "@/lib/utils";

type WeeklyProgressDashboardProps = {
  progress: HouseholdWeeklyProgress;
  weekQuery: string;
  compact?: boolean;
};

export function WeeklyProgressDashboard({
  progress,
  weekQuery,
  compact = false,
}: WeeklyProgressDashboardProps) {
  const { householdTotals, familyDay, cubs, weekLabel } = progress;

  if (compact) {
    return (
      <Card className="bg-sky-50/50 dark:bg-sky-950/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">This week</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {weekLabel} — {householdTotals.completedTasks} task
              {householdTotals.completedTasks === 1 ? "" : "s"} approved,{" "}
              {householdTotals.focusMinutes} min focus, {householdTotals.xpEarned}{" "}
              XP earned.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {familyDay.status === "completed"
                ? `${FAMILY_DAY_LABEL} complete.`
                : familyDay.status === "in_progress"
                  ? `${FAMILY_DAY_LABEL} in progress (${familyDay.cubsReady}/${familyDay.cubsTotal} Cubs ready).`
                  : `${FAMILY_DAY_LABEL} not started.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/week?week=${weekQuery}`}>
              <Button variant="secondary">Weekly dashboard</Button>
            </Link>
            <Link href={`/dashboard/family-day?week=${weekQuery}`}>
              <Button>{FAMILY_DAY_LABEL}</Button>
            </Link>
            <Link href="/dashboard/tasks/templates#know-your-roots">
              <Button variant="secondary">{LEGACY_WEEKLY_LABEL}</Button>
            </Link>
            <Link href="/dashboard/tasks/templates#get-some-sun">
              <Button variant="secondary">{SUMMER_LITE_LABEL}</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HouseholdStat
          label="Tasks approved"
          value={String(householdTotals.completedTasks)}
          detail="Completed and credited this week"
        />
        <HouseholdStat
          label="Focus logged"
          value={`${householdTotals.focusMinutes} min`}
          detail="Focus blocks recorded this week"
        />
        <HouseholdStat
          label="Tasks submitted"
          value={String(householdTotals.tasksSubmitted)}
          detail={
            householdTotals.pendingReview > 0
              ? `${householdTotals.pendingReview} awaiting review now`
              : "Nothing waiting for review"
          }
          highlight={householdTotals.pendingReview > 0 ? "gold" : undefined}
        />
        <HouseholdStat
          label="XP earned"
          value={String(householdTotals.xpEarned)}
          detail="From tasks and bonuses this week"
        />
        <HouseholdStat
          label="Focus Tokens"
          value={String(householdTotals.focusTokensEarned)}
          detail="Earned this week"
        />
        <HouseholdStat
          label="Phone time earned"
          value={formatMinutes(householdTotals.phoneMinutesEarned)}
          detail="Credited this week"
        />
      </dl>

      <Card
        className={cn(
          familyDay.status === "completed" &&
            "border-cub-green/30 bg-cub-green-muted",
          familyDay.status === "in_progress" &&
            "border-cub-gold/30 bg-cub-gold-muted",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{FAMILY_DAY_LABEL}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {familyDay.status === "completed"
                ? `Completed for ${weekLabel}.`
                : familyDay.status === "in_progress"
                  ? `${familyDay.cubsReady} of ${familyDay.cubsTotal} Cub${
                      familyDay.cubsTotal === 1 ? "" : "s"
                    } ready to complete.`
                  : `Not started for ${weekLabel}.`}
            </p>
          </div>
          <Link href={`/dashboard/family-day?week=${weekQuery}`}>
            <Button
              variant={familyDay.status === "completed" ? "secondary" : "primary"}
            >
              {familyDay.status === "completed"
                ? `View ${FAMILY_DAY_LABEL}`
                : familyDay.status === "in_progress"
                  ? `Continue ${FAMILY_DAY_LABEL}`
                  : `Run ${FAMILY_DAY_LABEL}`}
            </Button>
          </Link>
        </div>
      </Card>

      {cubs.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add a Cub profile to track weekly progress.
          </p>
          <Link href="/dashboard/cubs/new" className="mt-4 inline-block">
            <Button>Add Cub</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">By Cub</h2>
          <ul className="space-y-3">
            {cubs.map((cub) => (
              <li key={cub.cubId}>
                <Card
                  className={cn(
                    "p-4",
                    cubAccentClassNames(cub.cubId, { border: true }),
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <CubColorBadge
                      cubId={cub.cubId}
                      displayName={cub.displayName}
                    />
                    <div className="flex flex-wrap gap-2">
                      {cub.familyDayReady ? (
                        <span className="rounded-full bg-cub-green-muted px-2 py-0.5 text-xs font-medium text-cub-green-light">
                          {FAMILY_DAY_LABEL} ready
                        </span>
                      ) : cub.familyDaySaved ? (
                        <span className="rounded-full bg-cub-gold-muted px-2 py-0.5 text-xs font-medium text-cub-gold-light">
                          {FAMILY_DAY_LABEL} in progress
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {FAMILY_DAY_LABEL} not started
                        </span>
                      )}
                      <Link
                        href={`/dashboard/cubs/${cub.cubId}/progress`}
                        className="text-sm font-medium text-cub-gold hover:text-cub-gold-light"
                      >
                        Lifetime progress →
                      </Link>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <CubStat
                      label="Approved"
                      value={String(cub.completedTasks)}
                    />
                    <CubStat
                      label="Focus"
                      value={`${cub.focusMinutes} min`}
                    />
                    <CubStat
                      label="Submitted"
                      value={String(cub.tasksSubmitted)}
                    />
                    <CubStat
                      label="Awaiting review"
                      value={String(cub.submittedAwaitingReview)}
                      highlight={cub.submittedAwaitingReview > 0}
                    />
                    <CubStat label="XP earned" value={String(cub.xpEarned)} />
                    <CubStat
                      label="Tokens earned"
                      value={String(cub.focusTokensEarned)}
                    />
                    <CubStat
                      label="Phone earned"
                      value={formatMinutes(cub.phoneMinutesEarned)}
                    />
                  </dl>

                  <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-cub-off-white/10">
                    <CubLedgerTimeline
                      cubId={cub.cubId}
                      entries={cub.ledgerEntries}
                      label={`${cub.displayName}'s task history this week`}
                      emptyMessage="No task history this week yet."
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HouseholdStat({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: "gold";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        highlight === "gold" &&
          "border-cub-gold/30 bg-cub-gold-muted",
        !highlight && "border-zinc-200 dark:border-cub-off-white/10",
      )}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function CubStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-semibold",
          highlight && "text-cub-gold-light",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
