import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import { cn } from "@/lib/utils";

type CubProgressSummaryProps = {
  summary: CubRewardSummary;
  cubName: string;
  className?: string;
};

export function CubProgressSummary({
  summary,
  cubName,
  className,
}: CubProgressSummaryProps) {
  const atDailyCap =
    summary.phoneMinutesToday >= summary.dailyPhoneCapMinutes &&
    summary.dailyPhoneCapMinutes > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Rank · {summary.rank.current.name}
        </p>
        <p className="mt-1 text-2xl font-bold">{summary.totalXp} XP</p>
        {summary.rank.next ? (
          <>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-600"
                style={{ width: `${summary.rank.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {summary.rank.xpToNext} XP to {summary.rank.next.name}
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">Top rank reached</p>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Focus Tokens"
          value={String(summary.totalFocusTokens)}
          detail="Spend in the Reward Store"
        />
        <StatCard
          label="Phone time today"
          value={formatMinutes(summary.phoneMinutesAvailableToday)}
          detail={
            atDailyCap
              ? `Daily cap reached (${formatMinutes(summary.dailyPhoneCapMinutes)})`
              : `${formatMinutes(summary.phoneMinutesToday)} total · cap ${formatMinutes(summary.dailyPhoneCapMinutes)}`
          }
          highlight={atDailyCap ? "amber" : undefined}
        />
        <StatCard
          label="Earned from tasks"
          value={formatMinutes(summary.phoneMinutesFromTasksToday)}
          detail="Phone time credited when you approve tasks"
        />
        <StatCard
          label="Redeemed from store"
          value={formatMinutes(summary.phoneMinutesFromRedemptionsToday)}
          detail="Phone time applied when Focus Tokens are redeemed"
          highlight={
            summary.phoneMinutesFromRedemptionsToday > 0 ? "green" : undefined
          }
        />
        <StatCard
          label="Weekend Bank"
          value={formatMinutes(summary.weekendBankMinutes)}
          detail={`Cap ${formatMinutes(summary.weekendBankCapMinutes)}`}
        />
        <StatCard
          label="Parent note"
          value="Manual access"
          detail={`C.U.B. Code calculates earned freedom for ${cubName}. You control the device.`}
        />
      </dl>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: "amber" | "green";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        highlight === "amber" &&
          "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
        highlight === "green" &&
          "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
        !highlight && "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}
