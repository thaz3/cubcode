import Link from "next/link";
import { redirect } from "next/navigation";
import { WeeklyProgressDashboard } from "@/components/weekly-progress-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import {
  formatWeekLabel,
  formatWeekParam,
  getWeekStart,
  parseWeekParam,
  shiftWeek,
} from "@/lib/council-day";
import { getFamilyForUser } from "@/lib/session";
import { getHouseholdWeeklyProgress } from "@/lib/weekly-progress";

type WeekProgressPageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function WeekProgressPage({
  searchParams,
}: WeekProgressPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const { week } = await searchParams;
  const weekStartsOn = parseWeekParam(week);
  const weekLabel = formatWeekLabel(weekStartsOn);
  const weekQuery = formatWeekParam(weekStartsOn);
  const prevWeek = formatWeekParam(shiftWeek(weekStartsOn, -1));
  const nextWeek = formatWeekParam(shiftWeek(weekStartsOn, 1));
  const currentWeekQuery = formatWeekParam(getWeekStart());
  const isCurrentWeek = weekQuery === currentWeekQuery;

  const progress = await getHouseholdWeeklyProgress(
    family.id,
    family.cubs,
    weekStartsOn,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="This week"
        subtitle="Household snapshot — tasks, focus, rewards, and Family Day."
        backHref="/dashboard"
        backLabel="Today"
      />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Week of</p>
          <p className="text-lg font-semibold">{weekLabel}</p>
          {isCurrentWeek ? (
            <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
              Current week
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/week?week=${prevWeek}`}>
            <Button variant="secondary">← Previous week</Button>
          </Link>
          {!isCurrentWeek ? (
            <Link href={`/dashboard/week?week=${currentWeekQuery}`}>
              <Button variant="secondary">This week</Button>
            </Link>
          ) : null}
          <Link href={`/dashboard/week?week=${nextWeek}`}>
            <Button variant="secondary">Next week →</Button>
          </Link>
        </div>
      </Card>

      <WeeklyProgressDashboard progress={progress} weekQuery={weekQuery} />
    </div>
  );
}
