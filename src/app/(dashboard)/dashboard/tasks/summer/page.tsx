import Link from "next/link";
import { TaskTemplateCard } from "@/components/task-template-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ensureDefaultSummerTemplates,
  SUMMER_LITE_FULL_LABEL,
  SUMMER_LITE_LABEL,
} from "@/lib/summer-task-templates";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SummerTaskBoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await ensureDefaultSummerTemplates(family.id);

  const summerTemplates = await db.taskTemplate.findMany({
    where: { familyId: family.id, category: "SUMMER_LITE" },
    orderBy: [{ isActive: "desc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-amber-700">
            ← Assignment board
          </Link>
          <p className="mt-2 text-sm font-medium text-sky-800 dark:text-sky-300">
            Milestone 4 · {SUMMER_LITE_FULL_LABEL}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{SUMMER_LITE_LABEL} task board</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Parent-selected outdoor tasks — parks, libraries, walks, family history
            outside, creative projects, and community service. You choose the
            template, set supervision, and approve proof. No public events, GPS,
            or social features.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tasks/templates/new?type=summer">
            <Button variant="secondary">New {SUMMER_LITE_LABEL} template</Button>
          </Link>
          <Link href="/dashboard/tasks/templates#get-some-sun">
            <Button variant="secondary">All templates</Button>
          </Link>
        </div>
      </div>

      {summerTemplates.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">No {SUMMER_LITE_LABEL} templates available.</p>
        </Card>
      ) : (
        <SwipeCardDeck>
          {summerTemplates.map((template) => (
            <TaskTemplateCard key={template.id} template={template} highlight="summer" />
          ))}
        </SwipeCardDeck>
      )}
    </div>
  );
}
