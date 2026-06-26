"use client";

import { useActionState } from "react";
import type { Challenge, Cub } from "@/generated/prisma/client";
import { ProofConfigFields } from "@/components/proof-config-fields";
import { ChallengeIntervalFields } from "@/components/challenge-interval-fields";
import { ChallengeRewardFields } from "@/components/challenge-reward-fields";
import { GrowthAreaFields } from "@/components/growth-area-fields";
import { RoutineCubAssignmentFields } from "@/components/routine-cub-assignment-fields";
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
  assignedCubIds?: string[];
  groupMemberIds?: string[];
  defaultCubId?: string;
  submitLabel: string;
};

export function ChallengeForm({
  cubs,
  challenge,
  assignedCubIds,
  groupMemberIds,
  defaultCubId,
  submitLabel,
}: ChallengeFormProps) {
  const action = challenge ? updateChallengeAction : createChallengeAction;
  const [state, formAction, pending] = useActionState(action, {} as ActionState);

  const checklistItems = challenge
    ? getChallengeChecklistItems(challenge)
    : undefined;

  const selectedCubIds =
    assignedCubIds ?? (defaultCubId ? [defaultCubId] : []);

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
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
            placeholder="What should your Cub do each time?"
          />
        </div>

        {cubs.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Add a Cub profile before assigning a routine.
          </p>
        ) : (
          <RoutineCubAssignmentFields
            cubs={cubs}
            defaultSelectedCubIds={selectedCubIds}
            groupMemberIds={groupMemberIds}
          />
        )}

        <ChallengeIntervalFields
          initialIntervalType={challenge?.intervalType}
          initialCustomDays={
            challenge ? getCustomDaysOfWeek(challenge) : undefined
          }
        />

        <GrowthAreaFields initialValue={challenge?.growthCategory} />

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

      <Button type="submit" fullWidth size="lg" disabled={pending || cubs.length === 0}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
