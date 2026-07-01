import Link from "next/link";
import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { cubKidStatCard, cubKidTextMuted } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubAccumulatedRewardsPanelProps = {
  summary: CubRewardSummary;
  cubId: string;
};

function RewardStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className={cn(cubKidStatCard, "relative px-3 py-2.5")}>
      <p className="text-lg leading-none" aria-hidden>
        {icon}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-kid-purple">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-black leading-tight text-kid-ink">{value}</p>
    </div>
  );
}

export function CubAccumulatedRewardsPanel({
  summary,
  cubId,
}: CubAccumulatedRewardsPanelProps) {
  return (
    <CubKidPanel variant="violet" contentClassName="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-kid-purple">
            💎 Your stash
          </p>
          <p className={cn("mt-1 text-sm", cubKidTextMuted)}>
            Everything you&apos;ve earned so far.
          </p>
        </div>
        <Link
          href={`/cub/${cubId}/rewards`}
          className="shrink-0 text-xs font-black text-kid-purple hover:underline"
        >
          Prize Room →
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <RewardStat icon="⭐" label="XP" value={String(summary.totalXp)} />
        <RewardStat
          icon="🪙"
          label="Focus Tokens"
          value={String(summary.totalFocusTokens)}
        />
        <RewardStat
          icon="📱"
          label="Phone earned"
          value={formatMinutes(summary.totalPhoneMinutes)}
        />
        <RewardStat
          icon="🎁"
          label="Bonus phone"
          value={formatMinutes(summary.weekendBankMinutes)}
        />
      </dl>
      <p className={cn("text-xs", cubKidTextMuted)}>
        {formatMinutes(summary.phoneMinutesAvailableToday)} available today · your
        parent decides when to use phone time.
      </p>
    </CubKidPanel>
  );
}
