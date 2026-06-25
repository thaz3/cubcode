import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CubLink } from "@/components/cub-link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatChallengeSummary } from "@/lib/challenge-labels";
import { redirect } from "next/navigation";

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const challenges = await db.challenge.findMany({
    where: { familyId: family.id, status: { not: "ARCHIVED" } },
    include: { cub: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenges"
        subtitle="Repeatable routines — not one-time tasks."
        action={
          <Link href="/dashboard/create?kind=challenge">
            <Button size="lg">New challenge</Button>
          </Link>
        }
        backHref="/dashboard"
        backLabel="Today"
      />

      {challenges.length === 0 ? (
        <EmptyState
          title="No challenges yet"
          description="Create a repeating routine like “Clean bedroom every Sunday” and assign it to a Cub."
          actionLabel="Create challenge"
          actionHref="/dashboard/create?kind=challenge"
        />
      ) : (
        <ul className="space-y-3">
          {challenges.map((challenge) => (
            <li key={challenge.id}>
              <Link href={`/dashboard/challenges/${challenge.id}`}>
                <Card variant="interactive" className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-50">
                      {challenge.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        challenge.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {challenge.status === "ACTIVE" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <CubLink
                      cubId={challenge.cub.id}
                      displayName={challenge.cub.displayName}
                      linked={false}
                      className="text-cub-gold"
                    />{" "}
                    · {formatChallengeInterval(challenge.intervalType, challenge.intervalConfig)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatChallengeSummary(challenge)}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
