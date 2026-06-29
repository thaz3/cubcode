import { ParentAssignEarnPanel } from "@/components/parent-assign-earn-panel";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { parseParentAssignKind } from "@/lib/earn-types";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

type AssignWorkPageProps = {
  searchParams: Promise<{ kind?: string; cubId?: string }>;
};

export default async function AssignWorkPage({ searchParams }: AssignWorkPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const params = await searchParams;
  const defaultKind = parseParentAssignKind(params.kind);
  const defaultCubId = params.cubId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign work"
        subtitle="Choose an earn type — routine, task, Growth Pick, Training Path, or bonus."
        backHref="/dashboard/tasks"
        backLabel="Assignments"
      />

      <Card className="p-4 sm:p-6">
        <ParentAssignEarnPanel
          key={`${defaultKind}-${defaultCubId ?? ""}`}
          cubs={family.cubs}
          defaultKind={defaultKind}
          defaultCubId={defaultCubId}
        />
      </Card>
    </div>
  );
}
