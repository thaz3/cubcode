import Link from "next/link";
import { TaskTemplateCard } from "@/components/task-template-card";
import { TaskLibraryWorkflow } from "@/components/task-board-workflow";
import { TrainingPacksRoutinesSection } from "@/components/training-packs-routines-section";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ensureDefaultLegacyTemplates,
  LEGACY_WEEKLY_LABEL,
} from "@/lib/legacy-task-templates";
import {
  ensureDefaultSummerTemplates,
  SUMMER_LITE_FULL_LABEL,
  SUMMER_LITE_LABEL,
} from "@/lib/summer-task-templates";
import { partitionLibraryTasks } from "@/lib/task-board-sections";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

const MILESTONE_TEMPLATE_CATEGORIES = ["LEGACY_WEEKLY", "SUMMER_LITE"] as const;

export default async function TrainingPacksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await Promise.all([
    ensureDefaultLegacyTemplates(family.id),
    ensureDefaultSummerTemplates(family.id),
  ]);

  const [templates, libraryTasks, routines] = await Promise.all([
    db.taskTemplate.findMany({
      where: { familyId: family.id },
      orderBy: [{ isActive: "desc" }, { title: "asc" }],
    }),
    db.task.findMany({
      where: { familyId: family.id, status: "AVAILABLE" },
      include: { cub: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
    db.challenge.findMany({
      where: { familyId: family.id, status: { not: "ARCHIVED" } },
      include: { cub: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  const legacyTemplates = templates.filter(
    (template) => template.category === "LEGACY_WEEKLY",
  );
  const summerTemplates = templates.filter(
    (template) => template.category === "SUMMER_LITE",
  );
  const otherTemplates = templates.filter(
    (template) =>
      !MILESTONE_TEMPLATE_CATEGORIES.includes(
        template.category as (typeof MILESTONE_TEMPLATE_CATEGORIES)[number],
      ),
  );

  const readyToAssign = partitionLibraryTasks(libraryTasks);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-amber-700">
            ← Tasks
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Training Packs</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Reusable definitions, saved tasks ready to assign, and household
            routines — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/create">
            <Button variant="secondary">Create task or routine</Button>
          </Link>
          <Link href="/dashboard/tasks/templates/new?type=summer">
            <Button variant="secondary">New {SUMMER_LITE_LABEL} pack</Button>
          </Link>
          <Link href="/dashboard/tasks/templates/new?type=legacy">
            <Button variant="secondary">New {LEGACY_WEEKLY_LABEL} pack</Button>
          </Link>
          <Link href="/dashboard/tasks/templates/new">
            <Button>New training pack</Button>
          </Link>
        </div>
      </div>

      <section id="ready-to-assign" className="scroll-mt-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Ready to assign</h2>
          <p className="mt-1 text-sm text-zinc-500">
            One-off tasks you created and saved for later. Assign them to a Cub
            when you are ready.
          </p>
        </div>
        <TaskLibraryWorkflow tasks={readyToAssign} cubs={family.cubs} />
      </section>

      <TrainingPacksRoutinesSection routines={routines} />

      <Card
        id="get-some-sun"
        className="scroll-mt-8 border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/20"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
              Milestone 4 · {SUMMER_LITE_FULL_LABEL}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{SUMMER_LITE_LABEL} packs</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Outdoor and community training packs — park, library, walking
              observation, family history outside, creative projects, and service.
            </p>
          </div>
          <Link href="/dashboard/tasks/summer">
            <Button variant="secondary">{SUMMER_LITE_LABEL} board</Button>
          </Link>
        </div>

        {summerTemplates.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No {SUMMER_LITE_LABEL} training packs available.
          </p>
        ) : (
          <SwipeCardDeck className="mt-4">
            {summerTemplates.map((template) => (
              <TaskTemplateCard
                key={template.id}
                template={template}
                highlight="summer"
                cubs={family.cubs}
              />
            ))}
          </SwipeCardDeck>
        )}
      </Card>

      <Card
        id="know-your-roots"
        className="scroll-mt-8 border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-800 dark:text-violet-300">
              Milestone 4 · {LEGACY_WEEKLY_LABEL}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{LEGACY_WEEKLY_LABEL} packs</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Optional once-a-week packs for Black history awareness, family
              identity, elder connection, and community pride.
            </p>
          </div>
          <Link href="/dashboard/week">
            <Button variant="secondary">Weekly progress</Button>
          </Link>
        </div>

        {legacyTemplates.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No {LEGACY_WEEKLY_LABEL} training packs available.
          </p>
        ) : (
          <SwipeCardDeck className="mt-4">
            {legacyTemplates.map((template) => (
              <TaskTemplateCard
                key={template.id}
                template={template}
                highlight="legacy"
                cubs={family.cubs}
              />
            ))}
          </SwipeCardDeck>
        )}
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Your training packs</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Chores, school, focus blocks, attitude tasks, and custom packs.
          </p>
        </div>

        {otherTemplates.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-500">No other training packs yet.</p>
          </Card>
        ) : (
          <SwipeCardDeck>
            {otherTemplates.map((template) => (
              <TaskTemplateCard
                key={template.id}
                template={template}
                cubs={family.cubs}
              />
            ))}
          </SwipeCardDeck>
        )}
      </section>
    </div>
  );
}
