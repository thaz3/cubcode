"use client";

import { useActionState } from "react";
import type { FocusActivityCard } from "@/generated/prisma/client";
import { FocusDeckCategoryFields } from "@/components/focus-deck-category-fields";
import { ProofConfigFields } from "@/components/proof-config-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  createFocusActivityCardAction,
  updateFocusActivityCardAction,
} from "@/lib/actions/focus-deck";
import { parseFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { getCardChecklistItems } from "@/lib/focus-deck-card";

type FocusActivityCardFormProps = {
  card?: FocusActivityCard;
  submitLabel: string;
};

export function FocusActivityCardForm({
  card,
  submitLabel,
}: FocusActivityCardFormProps) {
  const action = card ? updateFocusActivityCardAction : createFocusActivityCardAction;
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const initialPoints = card
    ? parseFocusDeckCategoryPoints(card.categoryPoints) ?? undefined
    : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {card ? <input type="hidden" name="cardId" value={card.id} /> : null}

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Card title</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={card?.title}
            placeholder="e.g. Walk + Witness"
          />
        </div>

        <div>
          <Label htmlFor="description">Short description</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            maxLength={2000}
            defaultValue={card?.description ?? ""}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
          />
        </div>

        <div>
          <Label htmlFor="instructions">Activity instructions</Label>
          <textarea
            id="instructions"
            name="instructions"
            rows={4}
            maxLength={4000}
            defaultValue={card?.instructions ?? ""}
            className="w-full min-h-24 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
            placeholder="What should your Cub do in the real world?"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="estimatedMinutes">Estimated minutes</Label>
            <Input
              id="estimatedMinutes"
              name="estimatedMinutes"
              type="number"
              min={5}
              max={480}
              defaultValue={card?.estimatedMinutes ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="locationType">Location</Label>
            <select
              id="locationType"
              name="locationType"
              defaultValue={card?.locationType ?? ""}
              className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100"
            >
              <option value="">Any</option>
              <option value="HOME">Home</option>
              <option value="OUTDOOR">Outdoor</option>
              <option value="COMMUNITY">Community</option>
              <option value="ANY">Flexible</option>
            </select>
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={card?.difficulty ?? ""}
              className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100"
            >
              <option value="">Not set</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="CHALLENGING">Challenging</option>
            </select>
          </div>
        </div>

        <FocusDeckCategoryFields initialPoints={initialPoints} />

        <ProofConfigFields
          initialValues={{
            proofType: card?.proofType,
            proofPrompt: card?.proofPrompt ?? undefined,
            proofChecklistItems: card ? getCardChecklistItems(card) : undefined,
          }}
        />

        <div className="grid gap-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phoneMinutesEarned">Phone time (minutes)</Label>
            <Input
              id="phoneMinutesEarned"
              name="phoneMinutesEarned"
              type="number"
              min={0}
              max={480}
              required
              defaultValue={card?.phoneMinutesEarned ?? 15}
            />
          </div>
          <div>
            <Label htmlFor="xpEarned">XP</Label>
            <Input
              id="xpEarned"
              name="xpEarned"
              type="number"
              min={0}
              max={10000}
              required
              defaultValue={card?.xpEarned ?? 10}
            />
          </div>
          <div>
            <Label htmlFor="focusTokensEarned">Focus Tokens</Label>
            <Input
              id="focusTokensEarned"
              name="focusTokensEarned"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={card?.focusTokensEarned ?? 1}
            />
          </div>
          <div>
            <Label htmlFor="focusMinutesEarned">Focus minutes</Label>
            <Input
              id="focusMinutesEarned"
              name="focusMinutesEarned"
              type="number"
              min={0}
              max={480}
              required
              defaultValue={card?.focusMinutesEarned ?? 30}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-cub-muted">
          <input
            type="checkbox"
            name="publish"
            value="true"
            defaultChecked={card?.status === "ACTIVE" || !card}
            className="rounded"
          />
          <span>Active — Cubs can receive this card on their weekly deck</span>
        </label>
      </div>

      {state.error ? <p className="text-sm text-cub-red-light">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-cub-green-light">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
