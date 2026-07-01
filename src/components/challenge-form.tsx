"use client";

import { useActionState, useEffect } from "react";
import type { Challenge, Cub } from "@/generated/prisma/client";
import { ProofConfigFields } from "@/components/proof-config-fields";
import { ChallengeIntervalFields } from "@/components/challenge-interval-fields";
import { ChallengeRewardFields } from "@/components/challenge-reward-fields";
import { GrowthAreaFields } from "@/components/growth-area-fields";
import { RoutineCubAssignmentFields } from "@/components/routine-cub-assignment-fields";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOBILE_TEXTAREA_CLASS } from "@/lib/mobile-form-styles";
import {
  logActionResult,
  logCreateButtonTap,
  logFormSubmit,
} from "@/lib/touch-debug";
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

  useEffect(() => {
    logActionResult("routine", state);
  }, [state]);

  return (
    <form
      action={formAction}
      className="space-y-6"
      onSubmit={() => logFormSubmit("routine", { submitLabel })}
    >
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
            className={MOBILE_TEXTAREA_CLASS}
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

      <FormSubmitFooter
        error={state.error}
        success={state.success}
        successAsDialog
        successDialogTitle="Routine created"
      >
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={pending || cubs.length === 0}
          className="relative z-[1] min-h-12 touch-manipulation"
          onPointerDown={() =>
            logCreateButtonTap("routine", { submitLabel, pending })
          }
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </FormSubmitFooter>
    </form>
  );
}
