import Link from "next/link";
import { redirect } from "next/navigation";
import { CouncilDayCompleteButton } from "@/components/council-day-complete-button";
import { CouncilDayCubForm } from "@/components/council-day-cub-form";
import { CouncilDayFamilyNotesForm } from "@/components/council-day-family-notes-form";
import { FamilyDayBonusesForm } from "@/components/family-day-bonuses-form";
import { FamilyDayResetButton } from "@/components/family-day-reset-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { startCouncilDayAction } from "@/lib/actions/council-day";
import { auth } from "@/lib/auth";
import {
  formatWeekLabel,
  formatWeekParam,
  getCouncilDayBonus,
  getCouncilDayPrompts,
  isCouncilDayEntryComplete,
  parseWeekParam,
  shiftWeek,
} from "@/lib/council-day";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { parseCouncilDayValueRatings } from "@/lib/council-day-values";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";

type FamilyDayPageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function FamilyDayPage({ searchParams }: FamilyDayPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const { week } = await searchParams;
  const weekStartsOn = parseWeekParam(week);
  const weekLabel = formatWeekLabel(weekStartsOn);
  const prevWeek = formatWeekParam(shiftWeek(weekStartsOn, -1));
  const nextWeek = formatWeekParam(shiftWeek(weekStartsOn, 1));
  const weekQuery = formatWeekParam(weekStartsOn);

  const familyDaySession = await db.councilDaySession.findUnique({
    where: {
      familyId_weekStartsOn: {
        familyId: family.id,
        weekStartsOn,
      },
    },
    include: { cubEntries: true },
  });

  const cubPanels = await Promise.all(
    family.cubs.map(async (cub) => {
      const entry = familyDaySession?.cubEntries.find((item) => item.cubId === cub.id);
      const weekStats = await getCubWeekStats(cub.id, weekStartsOn);
      const bonus = getCouncilDayBonus(cub.ageBand);

      return {
        cub,
        entry,
        weekStats,
        bonus,
        bonusXpGranted: entry?.bonusXpGranted ?? bonus.xp,
        bonusTokensGranted: entry?.bonusTokensGranted ?? bonus.focusTokens,
        prompts: getCouncilDayPrompts(cub.ageBand),
        initialValues: {
          winNote: entry?.winNote ?? "",
          growNote: entry?.growNote ?? "",
          familyGoalNote: entry?.familyGoalNote ?? "",
          reflection: entry?.reflection ?? "",
        },
        valueRatings: parseCouncilDayValueRatings(entry?.valueRatings),
      };
    }),
  );

  const allCubsReady =
    family.cubs.length > 0 &&
    cubPanels.every(({ cub, initialValues, valueRatings }) =>
      isCouncilDayEntryComplete(cub, { ...initialValues, valueRatings }),
    );

  const isComplete = Boolean(familyDaySession?.conductedAt);
  const lastSavedAt = familyDaySession
    ? familyDaySession.cubEntries.reduce<Date | null>((latest, entry) => {
        if (!latest || entry.updatedAt > latest) {
          return entry.updatedAt;
        }
        return latest;
      }, familyDaySession.updatedAt)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-cub-gold-light">
          Milestone 4 · {FAMILY_DAY_LABEL}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{FAMILY_DAY_LABEL}</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          A weekly household check-in: review progress, reflect together, rate
          values and expectations, and credit a small bonus when you finish.
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Week of</p>
          <p className="text-lg font-semibold">{weekLabel}</p>
          {isComplete ? (
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              Completed{" "}
              {familyDaySession!.conductedAt!.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : familyDaySession ? (
            <p className="mt-1 text-sm text-amber-700 dark:text-cub-gold-light">
              In progress — save progress for each Cub, then complete when ready.
              {lastSavedAt ? (
                <>
                  {" "}
                  Last saved{" "}
                  {lastSavedAt.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  .
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">Not started yet.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/family-day?week=${prevWeek}`}>
            <Button variant="secondary">← Previous week</Button>
          </Link>
          <Link href={`/dashboard/family-day?week=${nextWeek}`}>
            <Button variant="secondary">Next week →</Button>
          </Link>
        </div>
      </Card>

      {family.cubs.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add a Cub profile before running {FAMILY_DAY_LABEL}.
          </p>
          <Link href="/dashboard/cubs/new" className="mt-4 inline-block">
            <Button>Add Cub</Button>
          </Link>
        </Card>
      ) : !familyDaySession ? (
        <Card>
          <h2 className="text-lg font-semibold">Begin this week</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start {FAMILY_DAY_LABEL} for {weekLabel}. You&apos;ll walk through each
            Cub with age-appropriate prompts ({family.cubs.length} Cub
            {family.cubs.length === 1 ? "" : "s"}).
          </p>
          <form
            action={async () => {
              "use server";
              await startCouncilDayAction(weekQuery);
              redirect(`/dashboard/family-day?week=${weekQuery}`);
            }}
            className="mt-4"
          >
            <Button type="submit">Begin {FAMILY_DAY_LABEL}</Button>
          </form>
        </Card>
      ) : (
        <>
          {!isComplete ? (
            <Card className="border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/30">
              <p className="text-sm text-sky-950 dark:text-sky-100">
                <span className="font-medium">Save and return anytime.</span> Use
                &quot;Save progress&quot; on each Cub — you don&apos;t have to
                finish in one sitting. Come back this week to complete{" "}
                {FAMILY_DAY_LABEL}.
              </p>
            </Card>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Each Cub</h2>
            {cubPanels.map(({ cub, weekStats, prompts, initialValues, valueRatings }) => (
              <CouncilDayCubForm
                key={cub.id}
                sessionId={familyDaySession.id}
                cubId={cub.id}
                displayName={cub.displayName}
                ageBand={cub.ageBand}
                prompts={prompts}
                weekStats={weekStats}
                initialValues={initialValues}
                valueRatings={valueRatings}
                isComplete={isComplete}
              />
            ))}
          </section>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold">Bonuses on completion</h2>
            <FamilyDayBonusesForm
              sessionId={familyDaySession.id}
              readOnly={isComplete}
              cubs={cubPanels.map(({ cub, bonus, bonusXpGranted, bonusTokensGranted }) => ({
                id: cub.id,
                displayName: cub.displayName,
                suggestedXp: bonus.xp,
                suggestedTokens: bonus.focusTokens,
                bonusXpGranted,
                bonusTokensGranted,
              }))}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold">Household wrap-up</h2>
            <CouncilDayFamilyNotesForm
              sessionId={familyDaySession.id}
              initialNotes={familyDaySession.familyNotes ?? ""}
              readOnly={isComplete}
            />
            {!isComplete ? (
              <CouncilDayCompleteButton
                sessionId={familyDaySession.id}
                allCubsReady={allCubsReady}
              />
            ) : null}
            <FamilyDayResetButton
              sessionId={familyDaySession.id}
              wasComplete={isComplete}
            />
          </Card>
        </>
      )}
    </div>
  );
}
