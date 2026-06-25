"use client";

import { useActionState } from "react";
import type { Challenge, Cub } from "@/generated/prisma/client";
import { ProofConfigFields } from "@/components/proof-config-fields";
import { ChallengeIntervalFields } from "@/components/challenge-interval-fields";
import { ChallengeRewardFields } from "@/components/challenge-reward-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  createChallengeAction,
  updateChallengeAction,
} from "@/lib/actions/challenges";
import { getCustomDaysOfWeek } from "@/lib/challenge-intervals";
import { getChallengeChecklistItems } from "@/lib/challenge-checklist";

type ChallengeFormProps = {
  cubs: Cub[];
  challenge?: Challenge;
  defaultCubId?: string;
  submitLabel: string;
};

export function ChallengeForm({
  cubs,
  challenge,
  defaultCubId,
  submitLabel,
}: ChallengeFormProps) {
  const action = challenge ? updateChallengeAction : createChallengeAction;
  const [state, formAction, pending] = useActionState(action, {} as ActionState);

  const checklistItems = challenge
    ? getChallengeChecklistItems(challenge)
    : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {challenge ? (
        <input type="hidden" name="challengeId" value={challenge.id} />
      ) : null}

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Routine name</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={challenge?.title}
            placeholder="e.g. Clean bedroom"
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            maxLength={2000}
            defaultValue={challenge?.description ?? ""}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 focus:ring-2"
            placeholder="What should your Cub do each time?"
          />
        </div>

        <div>
          <Label htmlFor="cubId">Assign to</Label>
          <select
            id="cubId"
            name="cubId"
            required
            defaultValue={challenge?.cubId ?? defaultCubId}
            disabled={Boolean(challenge) || Boolean(defaultCubId)}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 focus:ring-2 disabled:opacity-60"
          >
            <option value="">Pick a Cub</option>
            {cubs.map((cub) => (
              <option key={cub.id} value={cub.id}>
                {cub.displayName}
              </option>
            ))}
          </select>
        </div>

        <ChallengeIntervalFields
          initialIntervalType={challenge?.intervalType}
          initialCustomDays={
            challenge ? getCustomDaysOfWeek(challenge) : undefined
          }
        />

        <ProofConfigFields
          initialValues={{
            proofType: challenge?.proofType,
            proofPrompt: challenge?.proofPrompt ?? undefined,
            proofChecklistItems: checklistItems,
          }}
        />

        <ChallengeRewardFields
          initialValues={
            challenge
              ? {
                  xpEarned: challenge.xpEarned,
                  focusTokensEarned: challenge.focusTokensEarned,
                  phoneMinutesEarned: challenge.phoneMinutesEarned,
                }
              : undefined
          }
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : state.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
