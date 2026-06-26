import { ParentAssignEarnPanel } from "@/components/parent-assign-earn-panel";
import { WaysToEarnSection } from "@/components/ways-to-earn-section";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ParentWaysToEarnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ways to Earn"
        subtitle="Five earn types — assign work, set growth picks, and award bonuses."
        backHref="/dashboard/tasks"
        backLabel="Assignments"
      />

      <WaysToEarnSection audience="parent" />

      <section className="rounded-xl border border-cub-off-white/10 bg-cub-charcoal/40 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-cub-off-white">Assign work</h2>
        <p className="mt-1 text-sm text-cub-muted">
          Start with an earn type, then complete the matching form.
        </p>
        <div className="mt-4">
          <ParentAssignEarnPanel cubs={family.cubs} />
        </div>
      </section>
    </div>
  );
}
