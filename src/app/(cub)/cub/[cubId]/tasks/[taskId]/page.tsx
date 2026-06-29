import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import {
  CubWorkflowTaskCard,
  type FocusGrowthContext,
} from "@/components/cub-workflow-task-card";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { db } from "@/lib/db";
import {
  formatGrowthWeekProgress,
  getAvailableGrowthCategoriesForCub,
  getCompletedGrowthCategoriesThisWeek,
  growthCategoryOptionsForCub,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import { notFound, redirect } from "next/navigation";

type CubTaskDetailPageProps = {
  params: Promise<{ cubId: string; taskId: string }>;
};

export default async function CubTaskDetailPage({
  params,
}: CubTaskDetailPageProps) {
  const { cubId, taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);

  const task = await db.task.findFirst({
    where: { id: taskId, familyId, cubId: cub.id },
    include: {
      focusBlocks: { select: { durationMinutes: true } },
    },
  });

  if (!task) notFound();

  let focusGrowth: FocusGrowthContext | null = null;
  if (task.category === "FOCUS_BLOCK") {
    const [completedGrowth, availableGrowth] = await Promise.all([
      getCompletedGrowthCategoriesThisWeek(cub.id),
      getAvailableGrowthCategoriesForCub(cub),
    ]);
    const requiredGrowth = parseRequiredGrowthCategories(cub);
    focusGrowth = {
      availableGrowthAreas: growthCategoryOptionsForCub(cub).filter((option) =>
        availableGrowth.includes(option.value),
      ),
      weekProgressLabel: formatGrowthWeekProgress(completedGrowth, requiredGrowth),
    };
  }

  return (
    <div className="space-y-5">
      <CubKidHero
        title={task.title}
        subtitle="Your assignment — follow the steps below."
        emoji={CUB_PAGE_EMOJI.assignments}
        backHref={`/cub/${cubId}/challenges`}
        backLabel="Quest Board"
      />

      <CubKidPanel variant="gold" contentClassName="p-1 sm:p-2">
        <CubWorkflowTaskCard
          task={task}
          cubId={cubId}
          focusGrowth={focusGrowth}
        />
      </CubKidPanel>
    </div>
  );
}
