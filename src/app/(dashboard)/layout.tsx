import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile-nav";
import { auth } from "@/lib/auth";
import {
  countUnseenGuardianNudges,
  syncGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
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
  let guardianNudgeCount = 0;
  if (session.user.id) {
    const family = await getFamilyForUser(session.user.id);
    if (family) {
      await syncGuardianNudgesForFamily(family.id);
      [pendingReviewCount, guardianNudgeCount] = await Promise.all([
        countPendingReviews(family.id).then((r) => r.total),
        countUnseenGuardianNudges(family.id),
      ]);
    }
  }

  return (
    <div className="min-h-dvh cub-app-shell">
      <DashboardNav
        pendingReviewCount={pendingReviewCount}
        guardianNudgeCount={guardianNudgeCount}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-nav-safe lg:py-8">
        {children}
      </main>
      <MobileNav
        pendingReviewCount={pendingReviewCount}
        guardianNudgeCount={guardianNudgeCount}
        userName={session.user.name}
        userEmail={session.user.email}
      />
    </div>
  );
}
