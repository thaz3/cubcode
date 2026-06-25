import Link from "next/link";
import { TaskTemplateCard } from "@/components/task-template-card";
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
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

const MILESTONE_TEMPLATE_CATEGORIES = ["LEGACY_WEEKLY", "SUMMER_LITE"] as const;

export default async function TaskTemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await Promise.all([
    ensureDefaultLegacyTemplates(family.id),
    ensureDefaultSummerTemplates(family.id),
  ]);

  const templates = await db.taskTemplate.findMany({
    where: { familyId: family.id },
    orderBy: [{ isActive: "desc" }, { title: "asc" }],
  });

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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-amber-700">
            ← Tasks
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Template board</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Reusable task definitions. Use <strong className="font-medium text-zinc-300">Assign to Cub</strong> on
            any template, or save to the{" "}
            <Link href="/dashboard/tasks/library" className="text-amber-600 hover:text-amber-500">
              task library
            </Link>{" "}
            to assign later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tasks/templates/new?type=summer">
            <Button variant="secondary">New {SUMMER_LITE_LABEL} template</Button>
          </Link>
          <Link href="/dashboard/tasks/templates/new?type=legacy">
            <Button variant="secondary">New {LEGACY_WEEKLY_LABEL} template</Button>
          </Link>
          <Link href="/dashboard/tasks/templates/new">
            <Button>New template</Button>
          </Link>
        </div>
      </div>

      <Card
        id="get-some-sun"
        className="scroll-mt-8 border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/20"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
              Milestone 4 · {SUMMER_LITE_FULL_LABEL}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{SUMMER_LITE_LABEL} tasks</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Outdoor and community templates — park, library, walking observation,
              family history outside, creative projects, and service. Parent picks
              tasks and approves proof.
            </p>
          </div>
          <Link href="/dashboard/tasks/summer">
            <Button variant="secondary">{SUMMER_LITE_LABEL} board</Button>
          </Link>
        </div>

        {summerTemplates.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No {SUMMER_LITE_LABEL} templates available.
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
            <h2 className="mt-1 text-xl font-semibold">{LEGACY_WEEKLY_LABEL} tasks</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Optional once-a-week tasks for Black history awareness, family
              identity, elder connection, neighborhood knowledge, and community
              pride. Pick a template below and tap <strong className="font-medium text-zinc-300">Assign to Cub</strong>.
            </p>
          </div>
          <Link href="/dashboard/week">
            <Button variant="secondary">Weekly progress</Button>
          </Link>
        </div>

        {legacyTemplates.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No {LEGACY_WEEKLY_LABEL} templates available.
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
          <h2 className="text-xl font-semibold">Your templates</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Chores, school, focus blocks, attitude tasks, and custom templates.
          </p>
        </div>

        {otherTemplates.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-500">No other templates yet.</p>
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
