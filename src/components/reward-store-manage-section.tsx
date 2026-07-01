"use client";

import { useState } from "react";
import { EditRewardStoreItemForm } from "@/components/edit-reward-store-item-form";
import type { RewardStoreItemOption } from "@/components/reward-store-redeem-panel";
import { Button } from "@/components/ui/button";
import { setRewardStoreItemActiveAction } from "@/lib/actions/rewards";
import { formatRewardGrantLabel } from "@/lib/reward-grant-labels";
import { cn } from "@/lib/utils";

type RewardStoreManageSectionProps = {
  items: RewardStoreItemOption[];
};

export function RewardStoreManageSection({
  items,
}: RewardStoreManageSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No rewards in the store yet. Add your first reward below.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const grantLabel = formatRewardGrantLabel(item);

        return (
          <li
            key={item.id}
            className={cn(
              "rounded-xl border p-4",
              item.isActive
                ? "border-cub-off-white/10 bg-cub-ebony/40"
                : "border-cub-off-white/5 bg-cub-ebony/20 opacity-80",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-cub-off-white">{item.title}</p>
                  {!item.isActive ? (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                      Inactive
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-1 text-sm text-cub-muted">{item.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-cub-muted">
                  {item.costFocusTokens} Focus Token
                  {item.costFocusTokens === 1 ? "" : "s"}
                  {grantLabel ? ` · ${grantLabel}` : null}
                  {item.grantType === "FOCUS_AREA_SWAP" ? " · +1 Focus area swap" : null}
                  {item.grantType === "NONE" ? " · Parent delivers" : null}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(isEditing ? null : item.id)}
                >
                  {isEditing ? "Close" : "Edit"}
                </Button>
                <form action={setRewardStoreItemActiveAction.bind(null, item.id)}>
                  <input
                    type="hidden"
                    name="isActive"
                    value={item.isActive ? "false" : "true"}
                  />
                  <Button
                    type="submit"
                    variant={item.isActive ? "dangerOutline" : "constructive"}
                    size="sm"
                  >
                    {item.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                </form>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4">
                <EditRewardStoreItemForm
                  item={item}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
