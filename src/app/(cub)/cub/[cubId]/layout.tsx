import { CubHeader } from "@/components/cub-header";
import { CubNav } from "@/components/cub-nav";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { sumLedgerAmounts } from "@/lib/rewards";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

type CubScopedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ cubId: string }>;
};

export default async function CubScopedLayout({
  children,
  params,
}: CubScopedLayoutProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { cub } = await requireCubForUser(cubId, session.user.id);
  const { totalFocusTokens } = await sumLedgerAmounts(cub.id);
  const family = await getFamilyForUser(session.user.id);
  const cubs =
    family?.cubs.map((item) => ({
      id: item.id,
      displayName: item.displayName,
    })) ?? [];

  return (
    <div className="cub-kid-atmosphere min-h-dvh">
      <CubHeader
        cubId={cubId}
        displayName={cub.displayName}
        focusTokens={totalFocusTokens}
        cubs={cubs}
      />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-nav-safe lg:py-8">
        {children}
      </main>
      <CubNav
        cubId={cubId}
        cubs={cubs}
        currentDisplayName={cub.displayName}
      />
    </div>
  );
}
