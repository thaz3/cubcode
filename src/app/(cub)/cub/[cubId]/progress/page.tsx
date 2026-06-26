import { GrowthAreasCard } from "@/components/growth-areas-card";
import { FocusDeckGrowthCard } from "@/components/focus-deck-growth-card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getWeekStart } from "@/lib/council-day";
import { getCubFocusDeckGrowthSummary } from "@/lib/focus-deck-growth";
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

  const { cub } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();
  const [growthSummary, focusDeckGrowth] = await Promise.all([
    getCubGrowthAreaSummary(cub, weekStartsOn),
    getCubFocusDeckGrowthSummary(cub.id, weekStartsOn),
  ]);

  return (
    <>
      <PageHeader
        title="My progress"
        subtitle="See how you're growing this week — tasks, routines, Focus Deck, and parent bonuses."
      />

      <div className="space-y-6">
        <GrowthAreasCard summary={growthSummary} audience="cub" cubId={cubId} />
        <FocusDeckGrowthCard summary={focusDeckGrowth} />
      </div>
    </>
  );
}
