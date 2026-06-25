"use client";

import { useActionState } from "react";
import { markGuardianNudgeSeenAction } from "@/lib/actions/guardian-nudges";
import type { ActionState } from "@/lib/actions/auth";

export function GuardianNudgeSeenButton({ nudgeId }: { nudgeId: string }) {
  const [, formAction, isPending] = useActionState(
    markGuardianNudgeSeenAction,
    {} as ActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="nudgeId" value={nudgeId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
      >
        {isPending ? "..." : "Mark seen"}
      </button>
    </form>
  );
}
