"use client";

import { useActionState } from "react";
import type { FocusActivityCard, FocusActivityCompletion } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ChecklistItemContent } from "@/components/checklist-item-content";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { submitFocusCompletionAction } from "@/lib/actions/focus-deck";
import { getCardChecklistItems } from "@/lib/focus-deck-card";
import { formatProofType } from "@/lib/task-labels";

type FocusCompletionSubmitFormProps = {
  completion: Pick<FocusActivityCompletion, "id" | "status" | "reviewNote">;
  card: Pick<FocusActivityCard, "proofType" | "proofPrompt" | "proofChecklistItems" | "title">;
};

export function FocusCompletionSubmitForm({
  completion,
  card,
}: FocusCompletionSubmitFormProps) {
  const [state, formAction, pending] = useActionState(
    submitFocusCompletionAction,
    {} as ActionState,
  );
  const checklistItems = getCardChecklistItems(card);

  if (completion.status !== "IN_PROGRESS" && completion.status !== "SENT_BACK") {
    return null;
  }

  return (
    <form action={formAction} className="space-y-4 border-t border-cub-charcoal pt-4">
      <input type="hidden" name="completionId" value={completion.id} />
      <h3 className="font-medium text-cub-off-white">Submit proof</h3>
      <p className="text-sm text-cub-muted">
        {card.title} · {formatProofType(card.proofType)}
      </p>
      {completion.status === "SENT_BACK" && completion.reviewNote ? (
        <p className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted px-3 py-2 text-sm text-cub-gold-light">
          Parent note: {completion.reviewNote}
        </p>
      ) : null}
      {card.proofPrompt ? (
        <p className="text-sm text-cub-muted">{card.proofPrompt}</p>
      ) : null}

      {card.proofType === "SHORT_REFLECTION" ? (
        <div>
          <Label htmlFor="reflection">Reflection</Label>
          <textarea
            id="reflection"
            name="reflection"
            rows={4}
            required
            className="w-full min-h-24 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
          />
        </div>
      ) : null}

      {card.proofType === "TIME_LOG" ? (
        <div>
          <Label htmlFor="timeLoggedMinutes">Minutes spent</Label>
          <input
            id="timeLoggedMinutes"
            name="timeLoggedMinutes"
            type="number"
            min={1}
            required
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100"
          />
        </div>
      ) : null}

      {card.proofType === "PARENT_APPROVAL" ? (
        <p className="text-sm text-cub-muted">
          Your parent will confirm you completed this activity when they review.
        </p>
      ) : null}

      {card.proofType === "CHECKLIST" && checklistItems.length > 0 ? (
        <ul className="space-y-2">
          {checklistItems.map((item, index) => (
            <li key={item}>
              <label className="flex items-start gap-2 text-sm text-cub-off-white">
                <input type="checkbox" name={`checklistItem${index}`} value="on" className="mt-1" />
                <ChecklistItemContent content={item} />
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      {state.error ? <p className="text-sm text-cub-red-light">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-cub-green-light">{state.success}</p>
      ) : null}

      <Button type="submit" variant="constructive" disabled={pending}>
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
