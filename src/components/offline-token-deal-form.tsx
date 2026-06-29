"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { recordOfflineTokenDealAction } from "@/lib/actions/token-deal";
import { MOBILE_TEXTAREA_CLASS, NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";

type CubOption = {
  id: string;
  displayName: string;
  focusTokens: number;
};

type OfflineTokenDealFormProps = {
  cubs: CubOption[];
};

export function OfflineTokenDealForm({ cubs }: OfflineTokenDealFormProps) {
  const [state, formAction, isPending] = useActionState(
    recordOfflineTokenDealAction,
    {} as ActionState,
  );

  if (cubs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Add a Cub profile first, then you can record offline token deals here.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="token-deal-cub">Cub</Label>
        <select
          id="token-deal-cub"
          name="cubId"
          required
          defaultValue=""
          className={NATIVE_SELECT_CLASS}
        >
          <option value="" disabled>
            Choose a Cub…
          </option>
          {cubs.map((cub) => (
            <option key={cub.id} value={cub.id}>
              {cub.displayName} — {cub.focusTokens} token
              {cub.focusTokens === 1 ? "" : "s"} saved
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="token-deal-type">Deal type</Label>
        <select
          id="token-deal-type"
          name="dealType"
          required
          defaultValue="earn"
          className={NATIVE_SELECT_CLASS}
        >
          <option value="earn">Cub earns tokens — e.g. cleaned the car for 5</option>
          <option value="spend">
            Cub cashes in tokens — e.g. 3 tokens for a later curfew
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="token-amount">Tokens</Label>
        <Input
          id="token-amount"
          name="tokenAmount"
          type="number"
          min={1}
          max={50}
          required
          placeholder="e.g. 5"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="token-agreement">What you agreed on</Label>
        <textarea
          id="token-agreement"
          name="agreement"
          rows={3}
          required
          minLength={3}
          maxLength={500}
          placeholder="e.g. Washed the car together · or · Extra hour curfew on Friday"
          className={MOBILE_TEXTAREA_CLASS}
        />
      </div>

      <FormSubmitFooter error={state.error} success={state.success}>
        <Button type="submit" variant="reward" disabled={isPending} fullWidth size="lg">
          {isPending ? "Recording…" : "Record offline deal"}
        </Button>
      </FormSubmitFooter>
    </form>
  );
}
