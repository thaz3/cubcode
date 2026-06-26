import Link from "next/link";
import { AssignmentsRoutinesSection } from "@/components/assignments-routines-section";
import { TaskBoardNav } from "@/components/task-board-nav";
import { TaskBoardWorkflow } from "@/components/task-board-workflow";
import { TaskTemplateCard } from "@/components/task-template-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTaskBoardSectionCounts, partitionLibraryTasks } from "@/lib/task-board-sections";
import { isThemedPackCategory } from "@/lib/themed-training-packs";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskBoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const [tasks, libraryTasks, routines, savedTemplates] = await Promise.all([
    db.task.findMany({
      where: {
        familyId: family.id,
        status: { not: "AVAILABLE" },
      },
      include: { cub: true },
      orderBy: [{ updatedAt: "desc" }],
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
    db.taskTemplate.findMany({
      where: { familyId: family.id, isActive: true },
      orderBy: [{ title: "asc" }],
    }),
  ]);

  const pendingReviewCount = tasks.filter((t) => t.status === "SUBMITTED").length;
  const sectionCounts = getTaskBoardSectionCounts(tasks);
  const readyToAssign = partitionLibraryTasks(libraryTasks);
  const householdTemplates = savedTemplates.filter(
    (template) => !isThemedPackCategory(template.category),
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Tasks & Routines"
        subtitle="Everyday assignments for your household — create, assign, track, and review."
        action={
          <div className="flex flex-wrap gap-2">
            {pendingReviewCount > 0 ? (
              <Link href="/dashboard/tasks/review">
                <Button size="lg">Review ({pendingReviewCount})</Button>
              </Link>
            ) : null}
            <Link href="/dashboard/create">
              <Button size="lg">Create task or routine</Button>
            </Link>
            <Link href="/dashboard/tasks/templates">
              <Button variant="secondary" size="lg">
                Training Board
              </Button>
            </Link>
          </div>
        }
      />

      <div className="sticky top-14 z-10 -mx-4 border-b border-cub-off-white/10 bg-cub-ebony/95 px-4 pb-3 backdrop-blur lg:top-16">
        <TaskBoardNav
          counts={sectionCounts}
          routinesCount={routines.length}
          libraryCount={readyToAssign.length}
        />
      </div>

      <TaskBoardWorkflow
        tasks={tasks}
        pendingReviewCount={pendingReviewCount}
        libraryTasks={readyToAssign}
        routinesSection={<AssignmentsRoutinesSection routines={routines} />}
      />

      {householdTemplates.length > 0 ? (
        <section id="saved-templates" className="scroll-mt-36 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Saved task definitions</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Reusable chores, school work, focus blocks, and custom tasks —
              not themed training packs.
            </p>
          </div>
          <SwipeCardDeck>
            {householdTemplates.map((template) => (
              <TaskTemplateCard
                key={template.id}
                template={template}
                cubs={family.cubs}
              />
            ))}
          </SwipeCardDeck>
        </section>
      ) : null}

      <Card className="border-cub-charcoal/80 bg-cub-charcoal/30">
        <p className="text-sm text-zinc-500">
          Themed learning decks live on the{" "}
          <Link href="/dashboard/tasks/templates" className="font-medium text-cub-gold">
            Training Board
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
