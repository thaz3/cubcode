type RedemptionRow = {
  id: string;
  createdAt: Date;
  focusTokensSpent: number;
  phoneMinutesGranted: number;
  weekendBankMinutesGranted: number;
  rewardStoreItem: {
    title: string;
    grantType: string;
  };
};

type CubRedemptionHistoryProps = {
  redemptions: RedemptionRow[];
};

export function CubRedemptionHistory({ redemptions }: CubRedemptionHistoryProps) {
  if (redemptions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No store redemptions yet. Redeem a reward to see where minutes are applied.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {redemptions.map((redemption) => (
        <li
          key={redemption.id}
          className="rounded-lg border border-zinc-200 px-3 py-3 text-sm dark:border-cub-off-white/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{redemption.rewardStoreItem.title}</p>
            <span className="text-xs text-zinc-500">
              {redemption.createdAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Spent {redemption.focusTokensSpent} Focus Token
            {redemption.focusTokensSpent === 1 ? "" : "s"}
          </p>
          {redemption.phoneMinutesGranted > 0 ? (
            <p className="mt-1 text-emerald-700 dark:text-emerald-400">
              +{redemption.phoneMinutesGranted} min applied to phone time today
            </p>
          ) : null}
          {redemption.weekendBankMinutesGranted > 0 ? (
            <p className="mt-1 text-emerald-700 dark:text-emerald-400">
              +{redemption.weekendBankMinutesGranted} min applied to Weekend Bank
            </p>
          ) : null}
          {redemption.phoneMinutesGranted === 0 &&
          redemption.weekendBankMinutesGranted === 0 ? (
            <p className="mt-1 text-zinc-500">Parent-delivered reward (no minutes credited)</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
