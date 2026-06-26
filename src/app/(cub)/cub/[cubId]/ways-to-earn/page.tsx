import { CubThisWeekSummarySection } from "@/components/cub-this-week-summary-section";
import { CubTodaysMissionsSection } from "@/components/cub-todays-missions-section";
import { WaysToEarnSection } from "@/components/ways-to-earn-section";
import { CubKidHero } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import {
  getCubActiveMissions,
  getCubWeekEarnSummary,
} from "@/lib/cub-week-earn-summary";
import { getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { redirect } from "next/navigation";

type WaysToEarnPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubWaysToEarnPage({ params }: WaysToEarnPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [missions, weekSummary] = await Promise.all([
    getCubActiveMissions(familyId, cub.id, weekStartsOn),
    getCubWeekEarnSummary(familyId, cub.id, weekStartsOn),
  ]);

  return (
    <div className="space-y-6">
      <CubKidHero
        title="Ways to Earn"
        subtitle="Five clear paths to earn points in C.U.B. Code."
        emoji={CUB_PAGE_EMOJI.waysToEarn}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <WaysToEarnSection audience="cub" cubId={cubId} />

      <CubTodaysMissionsSection missions={missions} />
      <CubThisWeekSummarySection cubId={cubId} summary={weekSummary} />
    </div>
  );
}
