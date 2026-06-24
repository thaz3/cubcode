"use client";

import { Button } from "@/components/ui/button";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { redeemRewardAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import type { RewardGrantType } from "@/generated/prisma/client";
import { formatRewardGrantLabel } from "@/lib/reward-grant-labels";
import { cn } from "@/lib/utils";
import { useActionState, useState } from "react";

export type RewardStoreItemOption = {
  id: string;
  title: string;
  description: string | null;
  costFocusTokens: number;
  grantType: RewardGrantType;
  minutesGranted: number | null;
  isActive: boolean;
};

type CubOption = {
  id: string;
  displayName: string;
  focusTokens: number;
};

type RewardStoreRedeemPanelProps = {
  items: RewardStoreItemOption[];
  cubs: CubOption[];
};

export function RewardStoreRedeemPanel({
  items,
  cubs,
}: RewardStoreRedeemPanelProps) {
  const activeItems = items.filter((item) => item.isActive);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    activeItems[0]?.id ?? null,
  );
  const [selectedCubId, setSelectedCubId] = useState(cubs[0]?.id ?? "");
  const [state, formAction, isPending] = useActionState(
    redeemRewardAction,
    {} as ActionState,
  );

  const selectedItem = activeItems.find((item) => item.id === selectedItemId);
  const selectedCub = cubs.find((cub) => cub.id === selectedCubId);
  const canAfford =
    selectedItem &&
    selectedCub &&
    selectedCub.focusTokens >= selectedItem.costFocusTokens;

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No rewards in the store yet.</p>;
  }

  if (cubs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Add a Cub before redeeming rewards from the store.
      </p>
    );
  }

  if (activeItems.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No active rewards. Add a new item or reactivate one from the list below.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Select a reward
        </p>
        <ul className="mt-2 space-y-2" role="listbox" aria-label="Reward store items">
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
                        <p className="mt-1 text-sm text-zinc-500">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.costFocusTokens} Focus Token
                        {item.costFocusTokens === 1 ? "" : "s"}
                        {grantLabel ? ` · ${grantLabel}` : ""}
                      </p>
                    </div>
                    {!item.isActive ? (
                      <span className="shrink-0 text-xs text-zinc-400">Inactive</span>
                    ) : isSelected ? (
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
      </div>

      <form action={formAction} className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div>
          <p className="mb-2 text-sm font-medium">Redeem for</p>
          <input type="hidden" name="cubId" value={selectedCubId} />
          <RadioChoiceList
            name="redeemCubChoice"
            value={selectedCubId}
            onChange={setSelectedCubId}
            options={cubs.map((cub) => ({
              value: cub.id,
              label: cub.displayName,
              description: `${cub.focusTokens} token${cub.focusTokens === 1 ? "" : "s"}`,
            }))}
          />
        </div>

        <input type="hidden" name="rewardStoreItemId" value={selectedItemId ?? ""} />

        {selectedItem && selectedCub ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedCub.displayName} will spend {selectedItem.costFocusTokens}{" "}
            Focus Token{selectedItem.costFocusTokens === 1 ? "" : "s"} on{" "}
            <span className="font-medium">{selectedItem.title}</span>.
            {!canAfford ? (
              <span className="text-red-600">
                {" "}
                Not enough tokens ({selectedCub.focusTokens} available).
              </span>
            ) : null}
          </p>
        ) : null}

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? (
          <p className="text-sm text-green-700">{state.success}</p>
        ) : null}

        <Button
          type="submit"
          disabled={!selectedItemId || !selectedCubId || !canAfford || isPending}
        >
          {isPending ? "Redeeming..." : "Redeem selected reward"}
        </Button>
      </form>
    </div>
  );
}
