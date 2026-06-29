import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import {
  cubKidSectionEyebrow,
  cubKidSectionTitle,
  cubKidStatCard,
  cubKidTextMuted,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubProgressViewProps = {
  summary: CubRewardSummary;
  className?: string;
};

function KidStatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: "purple" | "gold" | "sky";
}) {
  const accentBar = {
    purple: "bg-kid-purple",
    gold: "bg-kid-yellow",
    sky: "bg-kid-blue",
  }[accent ?? "purple"];

  return (
    <div className={cubKidStatCard}>
      <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-2xl", accentBar)} aria-hidden />
      <p className="text-xs font-black uppercase tracking-wide text-kid-purple">{label}</p>
      <p className="mt-1.5 text-2xl font-black text-kid-ink">{value}</p>
      {detail ? <p className={cn("mt-1 text-sm", cubKidTextMuted)}>{detail}</p> : null}
    </div>
  );
}

export function CubProgressView({ summary, className }: CubProgressViewProps) {
  const atDailyCap =
    summary.phoneMinutesToday >= summary.dailyPhoneCapMinutes &&
    summary.dailyPhoneCapMinutes > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <div>
          <p className={cubKidSectionEyebrow}>🏅 Your Rank</p>
          <p className="mt-1 text-sm font-black text-kid-purple">
            {summary.rank.current.name}
          </p>
          <p className={cn("mt-1 text-3xl", cubKidSectionTitle)}>{summary.totalXp} XP</p>
        </div>
        {summary.rank.next ? (
          <>
            <div className="h-4 overflow-hidden rounded-full border-2 border-kid-purple/15 bg-kid-lavender/50 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-kid-purple via-kid-pink to-kid-orange shadow-sm"
                style={{ width: `${summary.rank.progressPercent}%` }}
              />
            </div>
            <p className={cn("text-sm font-semibold", cubKidTextMuted)}>
              {summary.rank.xpToNext} XP to level up to {summary.rank.next.name}!
            </p>
          </>
        ) : (
          <p className="text-sm font-black text-emerald-600">
            ⭐ Top rank — legend status!
          </p>
        )}
      </CubKidPanel>

      <dl className="grid gap-3 sm:grid-cols-2">
        <KidStatCard
          label="Focus Tokens"
          value={String(summary.totalFocusTokens)}
          detail="Save up for rewards in the prize room"
          accent="gold"
        />
        <KidStatCard
          label="Phone time today"
          value={formatMinutes(summary.phoneMinutesAvailableToday)}
          detail={
            atDailyCap
              ? "Daily cap reached — ask your parent"
              : `${formatMinutes(summary.phoneMinutesToday)} earned today`
          }
          accent={atDailyCap ? "gold" : "sky"}
        />
        <KidStatCard
          label="Weekend Bank"
          value={formatMinutes(summary.weekendBankMinutes)}
          detail="Extra time saved for weekends"
          accent="purple"
        />
      </dl>

      <p className={cn("text-sm", cubKidTextMuted)}>
        Your parent controls when you can use your phone. Earned time is a guide,
        not automatic access.
      </p>
    </div>
  );
}
