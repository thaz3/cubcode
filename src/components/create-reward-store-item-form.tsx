"use client";

import { Button } from "@/components/ui/button";
import { RewardStoreItemFormFields } from "@/components/reward-store-item-form-fields";
import { createRewardStoreItemAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import type { RewardGrantType } from "@/generated/prisma/client";
import { useActionState, useState } from "react";

export function CreateRewardStoreItemForm() {
  const [state, formAction, isPending] = useActionState(
    createRewardStoreItemAction,
    {} as ActionState,
  );
  const [grantType, setGrantType] = useState<RewardGrantType>("NONE");

  return (
    <form action={formAction} className="space-y-4">
      <RewardStoreItemFormFields
        grantType={grantType}
        onGrantTypeChange={setGrantType}
      />
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
