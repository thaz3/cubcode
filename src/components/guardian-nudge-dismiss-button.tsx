"use client";

import { useActionState } from "react";
import { dismissGuardianNudgeAction } from "@/lib/actions/guardian-nudges";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";

export function GuardianNudgeDismissButton({
  nudgeId,
  compact = false,
}: {
  nudgeId: string;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    dismissGuardianNudgeAction,
    {} as ActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="nudgeId" value={nudgeId} />
      {compact ? (
        <button
          type="submit"
          disabled={isPending}
          className="text-sm text-cub-muted hover:text-cub-off-white disabled:opacity-50"
        >
          {isPending ? "..." : "Dismiss"}
        </button>
      ) : (
        <Button type="submit" variant="neutral" size="sm" disabled={isPending}>
          {isPending ? "..." : "Dismiss"}
        </Button>
      )}
      {state.error ? (
        <p className="mt-1 text-xs text-red-500">{state.error}</p>
      ) : null}
    </form>
  );
}
