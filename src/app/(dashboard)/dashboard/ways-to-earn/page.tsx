import Link from "next/link";
import { WaysToEarnSection } from "@/components/ways-to-earn-section";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ParentWaysToEarnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
          <Link href="/dashboard/tasks/assign">
            <Button size="lg">Open assign work</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
