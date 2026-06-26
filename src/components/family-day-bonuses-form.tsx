"use client";

import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { saveFamilyDayBonusesAction } from "@/lib/actions/council-day";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { formatMinutes } from "@/lib/ledger-labels";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

type FamilyDayBonusesFormProps = {
  sessionId: string;
  cubs: Array<{
    id: string;
    displayName: string;
    suggestedXp: number;
    suggestedTokens: number;
    suggestedPhoneMinutes: number;
    bonusXpGranted: number;
    bonusTokensGranted: number;
    bonusPhoneMinutesGranted: number;
  }>;
  readOnly?: boolean;
};

export function FamilyDayBonusesForm({
  sessionId,
  cubs,
  readOnly = false,
}: FamilyDayBonusesFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveFamilyDayBonusesAction,
    {} as ActionState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  if (readOnly) {
    return (
      <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        {cubs.map((cub) => (
          <li key={cub.id}>
            <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
            <span className="ml-2">
              +{cub.bonusXpGranted} XP
              {cub.bonusTokensGranted > 0
                ? ` · +${cub.bonusTokensGranted} Focus Token`
                : ""}
              {cub.bonusPhoneMinutesGranted > 0
                ? ` · +${formatMinutes(cub.bonusPhoneMinutesGranted)}`
                : ""}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Adjust what each Cub earns when you complete {FAMILY_DAY_LABEL}. Defaults
        come from their age band — change them before finishing.
      </p>
      <ul className="space-y-4">
        {cubs.map((cub) => (
          <li
            key={cub.id}
            className="rounded-lg border border-zinc-200 p-3 dark:border-cub-off-white/10"
          >
            <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
            <p className="mt-1 text-xs text-zinc-500">
              Suggested: +{cub.suggestedXp} XP
              {cub.suggestedTokens > 0
                ? ` · +${cub.suggestedTokens} token`
                : ""}
              {cub.suggestedPhoneMinutes > 0
                ? ` · +${formatMinutes(cub.suggestedPhoneMinutes)}`
                : ""}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor={`bonus-xp-${cub.id}`}>XP bonus</Label>
                <Input
                  id={`bonus-xp-${cub.id}`}
                  name={`bonusXp_${cub.id}`}
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={cub.bonusXpGranted}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`bonus-tokens-${cub.id}`}>Focus Tokens</Label>
                <Input
                  id={`bonus-tokens-${cub.id}`}
                  name={`bonusTokens_${cub.id}`}
                  type="number"
                  min={0}
                  max={99}
                  defaultValue={cub.bonusTokensGranted}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`bonus-phone-${cub.id}`}>Phone time (min)</Label>
                <Input
                  id={`bonus-phone-${cub.id}`}
                  name={`bonusPhone_${cub.id}`}
                  type="number"
                  min={0}
                  max={240}
                  defaultValue={cub.bonusPhoneMinutesGranted}
                  className="mt-1"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saving..." : "Save bonus amounts"}
      </Button>
    </form>
  );
}
