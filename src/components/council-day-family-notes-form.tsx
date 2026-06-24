"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { saveCouncilDayFamilyNotesAction } from "@/lib/actions/council-day";
import { useActionState } from "react";

type CouncilDayFamilyNotesFormProps = {
  sessionId: string;
  initialNotes: string;
  readOnly?: boolean;
};

export function CouncilDayFamilyNotesForm({
  sessionId,
  initialNotes,
  readOnly = false,
}: CouncilDayFamilyNotesFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveCouncilDayFamilyNotesAction,
    {} as ActionState,
  );

  if (readOnly) {
    if (!initialNotes) {
      return null;
    }

    return (
      <div>
        <h3 className="text-sm font-medium">Household notes</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
          {initialNotes}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <div>
        <Label htmlFor="familyNotes">Household notes (optional)</Label>
        <p className="mt-1 text-sm text-zinc-500">
          Decisions, boundaries, or themes for the week ahead.
        </p>
        <textarea
          id="familyNotes"
          name="familyNotes"
          defaultValue={initialNotes}
          rows={3}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saving..." : "Save household notes"}
      </Button>
    </form>
  );
}
