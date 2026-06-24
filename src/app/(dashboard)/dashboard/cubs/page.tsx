import Link from "next/link";
import { CubColorBadge } from "@/components/cub-color-dot";
import { CubLedgerTimeline } from "@/components/cub-ledger-history";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatAgeBand } from "@/lib/age-band-defaults";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { auth } from "@/lib/auth";
import { getCubLedgerEntries } from "@/lib/cub-ledger";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function CubsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const taskCountsByCub = await db.task.groupBy({
    by: ["cubId"],
    where: { familyId: family.id, cubId: { not: null } },
    _count: { _all: true },
  });

  const assignedCountByCubId = new Map(
    taskCountsByCub.map((row) => [row.cubId!, row._count._all]),
  );

  const cubLedgers = await Promise.all(
    family.cubs.map(async (cub) => ({
      cubId: cub.id,
      entries: await getCubLedgerEntries(cub.id, { limit: 4 }),
    })),
  );
  const ledgerEntriesByCubId = new Map(
    cubLedgers.map((row) => [row.cubId, row.entries]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cubs</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Parent-managed profiles. No separate Cub logins in Milestone 1.
          </p>
        </div>
        <Link href="/dashboard/cubs/new">
          <Button>Add Cub</Button>
        </Link>
      </div>

      {family.cubs.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add your first Cub to choose an age band and view suggested
            household caps.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {family.cubs.map((cub) => {
            const assignedCount = assignedCountByCubId.get(cub.id) ?? 0;

            return (
            <Card
              key={cub.id}
              className={`${cubAccentClassNames(cub.id, { border: true })}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
                </div>
                <h2 className="sr-only">{cub.displayName}</h2>
                <p className="text-sm text-zinc-500">
                  {formatAgeBand(cub.ageBand)}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {assignedCount === 0
                    ? "No tasks assigned"
                    : `${assignedCount} task${assignedCount === 1 ? "" : "s"} assigned`}
                </p>
                <div className="mt-3">
                  <p className="text-xs font-medium text-zinc-500">Ledger</p>
                  <CubLedgerTimeline
                    entries={ledgerEntriesByCubId.get(cub.id) ?? []}
                    limit={4}
                    emptyMessage="No ledger activity yet."
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/cubs/${cub.id}/tasks#assign-task`}>
                  <Button>Assign task</Button>
                </Link>
                <Link href={`/dashboard/cubs/${cub.id}/progress`}>
                  <Button variant="secondary">Progress</Button>
                </Link>
                <Link href={`/dashboard/cubs/${cub.id}/tasks`}>
                  <Button variant="secondary">Tasks</Button>
                </Link>
                <Link href={`/dashboard/cubs/${cub.id}/edit`}>
                  <Button variant="ghost">Edit</Button>
                </Link>
              </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
