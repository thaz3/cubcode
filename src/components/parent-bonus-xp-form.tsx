"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { awardParentBonusXpAction } from "@/lib/actions/parent-bonus";
import { MOBILE_TEXTAREA_CLASS, NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";
import { PARENT_BONUS_XP_OPTIONS } from "@/lib/validations/parent-bonus";
import type { GrowthCategory } from "@/generated/prisma/client";

type GrowthOption = {
  value: GrowthCategory;
  label: string;
};

type ParentBonusXpFormProps = {
  cubId: string;
  growthOptions: GrowthOption[];
};

export function ParentBonusXpForm({
  cubId,
  growthOptions,
}: ParentBonusXpFormProps) {
  const [state, formAction, isPending] = useActionState(
    awardParentBonusXpAction,
    {} as ActionState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4 border-t border-zinc-200 pt-4 dark:border-cub-off-white/10">
      <input type="hidden" name="cubId" value={cubId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bonus-amount">XP points</Label>
          <select
            id="bonus-amount"
            name="amount"
            required
            defaultValue=""
            className={NATIVE_SELECT_CLASS}
          >
            <option value="" disabled>
              Choose points…
            </option>
            {PARENT_BONUS_XP_OPTIONS.map((amount) => (
              <option key={amount} value={amount}>
                +{amount} XP
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bonus-growth-category">Growth area</Label>
          <select
            id="bonus-growth-category"
            name="growthCategory"
            required
            defaultValue=""
            className={NATIVE_SELECT_CLASS}
          >
            <option value="" disabled>
              Choose area…
            </option>
            {growthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bonus-reason">Reason</Label>
        <textarea
          id="bonus-reason"
          name="reason"
          rows={3}
          required
          minLength={3}
          maxLength={500}
          placeholder="What offline behavior did you notice? e.g. helped a sibling without being asked."
          className={MOBILE_TEXTAREA_CLASS}
        />
      </div>

      <FormSubmitFooter error={state.error} success={state.success}>
        <Button type="submit" variant="reward" disabled={isPending} fullWidth size="lg">
          {isPending ? "Awarding…" : "Award bonus XP"}
        </Button>
      </FormSubmitFooter>
    </form>
  );
}
