import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile-nav";
import { auth } from "@/lib/auth";
import { countPendingReviews } from "@/lib/pending-review";
import { requireParentUnlock } from "@/lib/require-parent-unlock";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.id) {
    await requireParentUnlock(session.user.id);
  }

  let pendingReviewCount = 0;
  if (session.user.id) {
    const family = await getFamilyForUser(session.user.id);
    if (family) {
      pendingReviewCount = await countPendingReviews(family.id).then((r) => r.total);
    }
  }

  return (
    <div className="min-h-dvh cub-app-shell">
      <DashboardNav
        pendingReviewCount={pendingReviewCount}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-nav-safe lg:py-8">
        {children}
      </main>
      <MobileNav
        pendingReviewCount={pendingReviewCount}
        userName={session.user.name}
        userEmail={session.user.email}
      />
    </div>
  );
}
