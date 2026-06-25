import { GrowthAreasCard } from "@/components/growth-areas-card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getWeekStart } from "@/lib/council-day";
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
  const growthSummary = await getCubGrowthAreaSummary(cub, weekStartsOn);

  return (
    <>
      <PageHeader
        title="My progress"
        subtitle="Your growth areas this week — tasks, focus, and tagged routines."
      />

      <GrowthAreasCard summary={growthSummary} audience="cub" cubId={cubId} />
    </>
  );
}
