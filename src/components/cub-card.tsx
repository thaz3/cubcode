import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { formatAgeBand } from "@/lib/age-band-defaults";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatMinutes } from "@/lib/ledger-labels";
import type { CubRewardSummary } from "@/lib/rewards";
import type { AgeBand } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

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
    <Card
      variant="constructive"
      className={cn(cubAccentClassNames(cub.id, { border: true }))}
    >
      <div className="space-y-4">
        <div>
          <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
          <p className="mt-2 text-sm text-cub-muted">{formatAgeBand(cub.ageBand)}</p>
          {rewards ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CubStat label="Rank" value={rewards.rank.current.name} tone="green" />
              <CubStat label="XP" value={String(rewards.totalXp)} tone="gold" />
              <CubStat
                label="Phone today"
                value={formatMinutes(rewards.phoneMinutesAvailableToday)}
                tone="gold"
              />
              <CubStat
                label="Tokens"
                value={String(rewards.totalFocusTokens)}
                tone="gold"
              />
            </div>
          ) : null}
          <p className="mt-2 text-sm text-cub-muted">
            {activeCount > 0
              ? `${activeCount} active task${activeCount === 1 ? "" : "s"}`
              : assignedCount > 0
                ? `${assignedCount} task${assignedCount === 1 ? "" : "s"} total`
                : "No tasks yet"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/cub/${cub.id}`} className="flex-1">
            <Button variant="constructive" fullWidth size="lg">
              Open Cub view
            </Button>
          </Link>
          <Link href={`/dashboard/cubs/${cub.id}/tasks`} className="flex-1">
            <Button variant="reward" fullWidth size="lg">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function CubStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "gold" | "green";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 shadow-sm",
        tone === "gold"
          ? "border-cub-gold/35 bg-cub-gold-muted/60"
          : "border-cub-green-bright/35 bg-cub-green-muted/60",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-wide",
          tone === "gold" ? "text-cub-gold-light" : "text-cub-green-light",
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-cub-off-white">
        {value}
      </p>
    </div>
  );
}
