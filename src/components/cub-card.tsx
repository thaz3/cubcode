import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { formatAgeBand } from "@/lib/age-band-defaults";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatMinutes } from "@/lib/ledger-labels";
import type { CubRewardSummary } from "@/lib/rewards";
import type { AgeBand } from "@/generated/prisma/client";

type CubCardProps = {
  cub: {
    id: string;
    displayName: string;
    ageBand: AgeBand;
  };
  assignedCount: number;
  activeCount: number;
  rewards: CubRewardSummary | null;
};

export function CubCard({
  cub,
  assignedCount,
  activeCount,
  rewards,
}: CubCardProps) {
  return (
    <Card className={cubAccentClassNames(cub.id, { border: true })}>
      <div className="space-y-4">
        <div>
          <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
          <p className="mt-2 text-sm text-zinc-400">{formatAgeBand(cub.ageBand)}</p>
          {rewards ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CubStat label="Rank" value={rewards.rank.current.name} />
              <CubStat label="XP" value={String(rewards.totalXp)} />
              <CubStat
                label="Phone today"
                value={formatMinutes(rewards.phoneMinutesAvailableToday)}
              />
              <CubStat
                label="Tokens"
                value={String(rewards.totalFocusTokens)}
              />
            </div>
          ) : null}
          <p className="mt-2 text-sm text-zinc-500">
            {activeCount > 0
              ? `${activeCount} active task${activeCount === 1 ? "" : "s"}`
              : assignedCount > 0
                ? `${assignedCount} task${assignedCount === 1 ? "" : "s"} total`
                : "No tasks yet"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/cub/${cub.id}`} className="flex-1">
            <Button fullWidth size="lg">
              Open Cub view
            </Button>
          </Link>
          <Link href={`/dashboard/cubs/${cub.id}/tasks`} className="flex-1">
            <Button variant="secondary" fullWidth size="lg">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function CubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}
