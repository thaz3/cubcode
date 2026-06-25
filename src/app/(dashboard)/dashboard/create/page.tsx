import { ParentCreateWorkPanel } from "@/components/parent-create-work-panel";
import type { ParentCreateKind } from "@/components/parent-create-work-panel";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

type CreateWorkPageProps = {
  searchParams: Promise<{ kind?: string; cubId?: string }>;
};

function parseKind(value: string | undefined): ParentCreateKind {
  return value === "challenge" ? "challenge" : "task";
}

export default async function CreateWorkPage({ searchParams }: CreateWorkPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const params = await searchParams;
  const defaultKind = parseKind(params.kind);
  const defaultCubId =
    params.cubId && family.cubs.some((c) => c.id === params.cubId)
      ? params.cubId
      : undefined;

  const backHref = defaultCubId
    ? `/dashboard/cubs/${defaultCubId}/tasks`
    : defaultKind === "challenge"
      ? "/dashboard/challenges"
      : "/dashboard/tasks";

  const backLabel = defaultCubId
    ? "Cub tasks"
    : defaultKind === "challenge"
      ? "Challenges"
      : "Tasks";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create"
        subtitle="Add a one-time task or a repeating routine for your household."
        backHref={backHref}
        backLabel={backLabel}
      />

      <Card className="p-4 sm:p-6">
        <ParentCreateWorkPanel
          cubs={family.cubs}
          defaultKind={defaultKind}
          defaultCubId={defaultCubId}
        />
      </Card>
    </div>
  );
}
