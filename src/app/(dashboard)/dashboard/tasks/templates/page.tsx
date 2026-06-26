import Link from "next/link";
import { TaskTemplateCard } from "@/components/task-template-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ensureDefaultLegacyTemplates,
} from "@/lib/legacy-task-templates";
import {
  ensureDefaultSummerTemplates,
} from "@/lib/summer-task-templates";
import {
  GET_SOME_SUN_LABEL,
  KNOW_YOUR_CITY_LABEL,
  KNOW_YOUR_ROOTS_LABEL,
  THEMED_PACK_SECTIONS,
  isThemedPackCategory,
} from "@/lib/themed-training-packs";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

const ACCENT_CARD: Record<"sky" | "violet" | "amber", string> = {
  sky: "border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/20",
  violet:
    "border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20",
  amber:
    "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
};

const ACCENT_LABEL: Record<"sky" | "violet" | "amber", string> = {
  sky: "text-sky-800 dark:text-sky-300",
  violet: "text-violet-800 dark:text-violet-300",
  amber: "text-amber-800 dark:text-amber-300",
};

export default async function ThemedTrainingPacksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await Promise.all([
    ensureDefaultLegacyTemplates(family.id),
    ensureDefaultSummerTemplates(family.id),
  ]);

  const templates = await db.taskTemplate.findMany({
    where: { familyId: family.id, isActive: true },
    orderBy: [{ title: "asc" }],
  });

  const templatesByCategory = {
    SUMMER_LITE: templates.filter((t) => t.category === "SUMMER_LITE"),
    LEGACY_WEEKLY: templates.filter((t) => t.category === "LEGACY_WEEKLY"),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Training Packs"
        subtitle="Themed learning decks — outdoor summer, Black history, and your city. Everyday tasks and routines live under Assignments."
        backHref="/dashboard/tasks"
        backLabel="Assignments"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/tasks/templates/new?type=summer">
              <Button variant="secondary" size="lg">
                New {GET_SOME_SUN_LABEL} pack
              </Button>
            </Link>
            <Link href="/dashboard/tasks/templates/new?type=legacy">
              <Button variant="secondary" size="lg">
                New {KNOW_YOUR_ROOTS_LABEL} pack
              </Button>
            </Link>
          </div>
        }
      />

      {THEMED_PACK_SECTIONS.map((section) => {
        const packs =
          section.category === null
            ? []
            : templatesByCategory[section.category];

        return (
          <Card
            key={section.id}
            id={section.id}
            className={cn("scroll-mt-36", ACCENT_CARD[section.accent])}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={cn("text-sm font-medium", ACCENT_LABEL[section.accent])}>
                  {section.milestone}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{section.label}</h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                  {section.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.boardHref && section.boardLabel ? (
                  <Link href={section.boardHref}>
                    <Button variant="secondary">{section.boardLabel}</Button>
                  </Link>
                ) : null}
                {section.newHref && section.newLabel ? (
                  <Link href={section.newHref}>
                    <Button>{section.newLabel}</Button>
                  </Link>
                ) : null}
              </div>
            </div>

            {packs.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                {section.category === null
                  ? `${KNOW_YOUR_CITY_LABEL} packs are coming soon.`
                  : `No ${section.label} packs available yet.`}
              </p>
            ) : (
              <SwipeCardDeck className="mt-4">
                {packs.map((template) => (
                  <TaskTemplateCard
                    key={template.id}
                    template={template}
                    highlight={
                      section.category === "SUMMER_LITE"
                        ? "summer"
                        : section.category === "LEGACY_WEEKLY"
                          ? "legacy"
                          : undefined
                    }
                    cubs={family.cubs}
                  />
                ))}
              </SwipeCardDeck>
            )}
          </Card>
        );
      })}

      <Card className="border-cub-charcoal/80 bg-cub-charcoal/30">
        <p className="text-sm text-zinc-500">
          Looking for chores, focus blocks, or custom one-off tasks? Those belong
          under{" "}
          <Link href="/dashboard/tasks" className="font-medium text-cub-gold">
            Assignments
          </Link>
          , not training packs.
        </p>
      </Card>
    </div>
  );
}
