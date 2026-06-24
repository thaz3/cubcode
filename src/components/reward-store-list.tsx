"use client";

import { Button } from "@/components/ui/button";
import { redeemRewardAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { useActionState, useState } from "react";
import type { RewardStoreItemOption } from "@/components/reward-store-redeem-panel";
import { formatRewardGrantLabel } from "@/lib/reward-grant-labels";

type RewardStoreListProps = {
  cubId: string;
  cubName: string;
  items: RewardStoreItemOption[];
  availableFocusTokens: number;
};

export function RewardStoreList({
  cubId,
  cubName,
  items,
  availableFocusTokens,
}: RewardStoreListProps) {
  const activeItems = items.filter((item) => item.isActive);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    activeItems[0]?.id ?? null,
  );
  const [state, formAction, isPending] = useActionState(
    redeemRewardAction,
    {} as ActionState,
  );

  const selectedItem = activeItems.find((item) => item.id === selectedItemId);
  const canAfford =
    selectedItem && availableFocusTokens >= selectedItem.costFocusTokens;

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No rewards in the store yet. Add items from the family Reward Store page.
      </p>
    );
  }

  if (activeItems.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No active rewards in the store right now.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2" role="listbox" aria-label="Reward store items">
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const selectable = item.isActive;
          const grantLabel = formatRewardGrantLabel(item);

          return (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={!selectable}
                onClick={() => selectable && setSelectedItemId(item.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                  selectable
                    ? "cursor-pointer hover:border-amber-300 dark:hover:border-amber-800"
                    : "cursor-not-allowed opacity-60",
                  isSelected && selectable
                    ? "border-amber-500 bg-amber-50/80 ring-1 ring-amber-500 dark:border-amber-600 dark:bg-amber-950/40 dark:ring-amber-600"
                    : "border-zinc-200 dark:border-zinc-800",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.costFocusTokens} Focus Token
                      {item.costFocusTokens === 1 ? "" : "s"}
                      {grantLabel ? ` · ${grantLabel}` : ""}
                    </p>
                  </div>
                  {isSelected && selectable ? (
                    <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">
                      Selected
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="cubId" value={cubId} />
        <input type="hidden" name="rewardStoreItemId" value={selectedItemId ?? ""} />

        {selectedItem ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Redeem <span className="font-medium">{selectedItem.title}</span> for{" "}
            {cubName} ({availableFocusTokens} token
            {availableFocusTokens === 1 ? "" : "s"} available).
            {!canAfford ? (
              <span className="text-red-600"> Not enough tokens.</span>
            ) : null}
          </p>
        ) : null}

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? (
          <p className="text-sm text-green-700">{state.success}</p>
        ) : null}

        <Button type="submit" disabled={!canAfford || !selectedItemId || isPending}>
          {isPending ? "Redeeming..." : "Redeem selected reward"}
        </Button>
      </form>
    </div>
  );
}
