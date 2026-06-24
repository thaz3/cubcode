import { DashboardNav } from "@/components/dashboard-nav";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  let pendingReviewCount = 0;
  if (session.user.id) {
    const family = await getFamilyForUser(session.user.id);
    if (family) {
      pendingReviewCount = await db.task.count({
        where: { familyId: family.id, status: "SUBMITTED" },
      });
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardNav pendingReviewCount={pendingReviewCount} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
