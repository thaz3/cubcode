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
import { countPendingReviews } from "@/lib/pending-review";
import { getReviewQueueItems } from "@/lib/review-queue";
import { getTaskBoardSectionCounts, partitionLibraryTasks } from "@/lib/task-board-sections";
import { countGroupedAssignmentRoutines } from "@/lib/assignment-routine-groups";
import { isThemedPackCategory } from "@/lib/themed-training-packs";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskBoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const [tasks, libraryTasks, routines, savedTemplates, pendingReviews, reviewQueueItems] =
    await Promise.all([
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
    countPendingReviews(family.id),
    getReviewQueueItems(family.id),
  ]);

  const pendingReviewCount = pendingReviews.total;
  const sectionCounts = getTaskBoardSectionCounts(tasks, pendingReviewCount);
  const groupedRoutineCount = countGroupedAssignmentRoutines(routines);
  const readyToAssign = partitionLibraryTasks(libraryTasks);
  const householdTemplates = savedTemplates.filter(
    (template) => !isThemedPackCategory(template.category),
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Assignments"
        subtitle="Assign work across five earn types — routines, tasks, Growth Picks, Training Path, and bonuses."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/tasks/assign">
              <Button size="lg">Assign work</Button>
            </Link>
            <Link href="/dashboard/tasks/templates">
              <Button variant="secondary" size="lg">
                Training Path
              </Button>
            </Link>
          </div>
        }
      />

      <div className="sticky top-14 z-10 -mx-4 border-b border-cub-off-white/10 bg-cub-ebony/95 px-4 pb-3 backdrop-blur lg:top-16">
        <TaskBoardNav
          counts={sectionCounts}
          routinesCount={groupedRoutineCount}
          libraryCount={readyToAssign.length}
        />
      </div>

      <TaskBoardWorkflow
        tasks={tasks}
        pendingReviewCount={pendingReviewCount}
        reviewQueueItems={reviewQueueItems}
        libraryTasks={readyToAssign}
        routinesCount={groupedRoutineCount}
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
            Training Path
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
