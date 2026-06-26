import { GrowthAreasCard } from "@/components/growth-areas-card";
import { CubTrainingProgressCard } from "@/components/cub-training-progress-card";
import { CubKidHero } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { getCubGrowthAreaSummary } from "@/lib/growth-area-summary";
import { redirect } from "next/navigation";

type CubProgressPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubModeProgressPage({
  params,
}: CubProgressPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();
  const [growthSummary, trainingSummary] = await Promise.all([
    getCubGrowthAreaSummary(cub, weekStartsOn),
    getCubTrainingBoardSummary(familyId, cub.id),
  ]);

  return (
    <div className="space-y-5">
      <CubKidHero
        title="My progress"
        subtitle="See how you're growing this week — tasks, routines, Growth Picks, Training Path, and bonuses."
        emoji={CUB_PAGE_EMOJI.progress}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <GrowthAreasCard summary={growthSummary} audience="cub" cubId={cubId} />
      <CubTrainingProgressCard cubId={cubId} summary={trainingSummary} />
    </div>
  );
}
