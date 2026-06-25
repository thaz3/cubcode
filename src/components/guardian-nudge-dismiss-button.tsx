"use client";

import { useActionState } from "react";
import { dismissGuardianNudgeAction } from "@/lib/actions/guardian-nudges";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";

export function GuardianNudgeDismissButton({ nudgeId }: { nudgeId: string }) {
  const [state, formAction, isPending] = useActionState(
    dismissGuardianNudgeAction,
    {} as ActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="nudgeId" value={nudgeId} />
      <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
        {isPending ? "..." : "Dismiss"}
      </Button>
      {state.error ? (
        <p className="mt-1 text-xs text-red-500">{state.error}</p>
      ) : null}
    </form>
  );
}
