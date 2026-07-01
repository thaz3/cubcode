"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RewardStoreItemFormFields,
  type RewardStoreItemFormValues,
} from "@/components/reward-store-item-form-fields";
import type { ActionState } from "@/lib/actions/auth";
import { updateRewardStoreItemAction } from "@/lib/actions/rewards";
import type { RewardGrantType } from "@/generated/prisma/client";

type EditRewardStoreItemFormProps = {
  item: RewardStoreItemFormValues & { id: string; description: string | null };
  onCancel?: () => void;
};

export function EditRewardStoreItemForm({
  item,
  onCancel,
}: EditRewardStoreItemFormProps) {
  const boundAction = updateRewardStoreItemAction.bind(null, item.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    {} as ActionState,
  );
  const [grantType, setGrantType] = useState<RewardGrantType>(item.grantType);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-cub-gold/25 bg-cub-gold-muted/10 p-4">
      <RewardStoreItemFormFields
        initialValues={{
          ...item,
          description: item.description ?? "",
        }}
        grantType={grantType}
        onGrantTypeChange={setGrantType}
      />
      {state.error ? <p className="text-sm text-cub-red-light">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-cub-green-light">{state.success}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
