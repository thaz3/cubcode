"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { createRewardStoreItemAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import { useActionState, useState } from "react";

export function CreateRewardStoreItemForm() {
  const [state, formAction, isPending] = useActionState(
    createRewardStoreItemAction,
    {} as ActionState,
  );
  const [grantType, setGrantType] = useState<"NONE" | "PHONE_TIME" | "WEEKEND_BANK">(
    "NONE",
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="reward-title">Reward title</Label>
        <Input id="reward-title" name="title" required placeholder="Extra screen time" />
      </div>
      <div>
        <Label htmlFor="reward-description">Description (optional)</Label>
        <textarea
          id="reward-description"
          name="description"
          rows={2}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="What the Cub gets when they redeem this"
        />
      </div>
      <div>
        <Label htmlFor="reward-cost">Cost (Focus Tokens)</Label>
        <Input
          id="reward-cost"
          name="costFocusTokens"
          type="number"
          min={1}
          max={50}
          defaultValue={1}
          required
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">What gets applied on redeem</p>
        <input type="hidden" name="grantType" value={grantType} />
        <RadioChoiceList
          name="grantTypeChoice"
          value={grantType}
          onChange={setGrantType}
          options={[
            {
              value: "NONE",
              label: "Parent delivers (no minutes credited)",
            },
            { value: "PHONE_TIME", label: "Phone time today" },
            { value: "WEEKEND_BANK", label: "Weekend Bank minutes" },
          ]}
        />
      </div>
      {grantType !== "NONE" ? (
        <div>
          <Label htmlFor="reward-minutes">Minutes to credit</Label>
          <Input
            id="reward-minutes"
            name="minutesGranted"
            type="number"
            min={1}
            max={240}
            defaultValue={15}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            {grantType === "PHONE_TIME"
              ? "Shows under Redeemed from store and Phone time today. Respects daily cap; overflow goes to Weekend Bank."
              : "Credits the Weekend Bank balance (respects bank cap)."}
          </p>
        </div>
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add reward"}
      </Button>
    </form>
  );
}
