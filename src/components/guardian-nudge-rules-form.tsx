"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  GUARDIAN_NUDGE_RULE_DESCRIPTIONS,
  GUARDIAN_NUDGE_RULE_LABELS,
} from "@/lib/guardian-nudges/types";
import { updateGuardianNudgeRuleAction } from "@/lib/actions/guardian-nudges";
import type { ActionState } from "@/lib/actions/auth";
import type { GuardianNudgeRule } from "@/generated/prisma/client";

type GuardianNudgeRulesFormProps = {
  rules: GuardianNudgeRule[];
};

export function GuardianNudgeRulesForm({ rules }: GuardianNudgeRulesFormProps) {
  const taskRules = rules.filter((rule) => rule.type !== "DAILY_SUMMARY");

  return (
    <div className="space-y-4">
      {taskRules.map((rule) => (
        <GuardianNudgeRuleRow key={rule.id} rule={rule} />
      ))}
    </div>
  );
}

function GuardianNudgeRuleRow({ rule }: { rule: GuardianNudgeRule }) {
  const [state, formAction, isPending] = useActionState(
    updateGuardianNudgeRuleAction,
    {} as ActionState,
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
    >
      <input type="hidden" name="type" value={rule.type} />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={rule.enabled}
          className="mt-1"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-zinc-100">
            {GUARDIAN_NUDGE_RULE_LABELS[rule.type]}
          </span>
          <span className="mt-1 block text-sm text-zinc-500">
            {GUARDIAN_NUDGE_RULE_DESCRIPTIONS[rule.type]}
          </span>
        </span>
      </label>

      {rule.type === "NOT_STARTED_BEFORE_DUE" ||
      rule.type === "NOT_TOUCHED_AFTER_ASSIGN" ? (
        <div className="mt-3">
          <label
            htmlFor={`offset-${rule.id}`}
            className="text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            {rule.type === "NOT_TOUCHED_AFTER_ASSIGN"
              ? "Nudge if no meaningful action within"
              : "Nudge if not started within this window before due"}
          </label>
          <select
            id={`offset-${rule.id}`}
            name="offsetMinutes"
            defaultValue={String(rule.offsetMinutes ?? 120)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm sm:max-w-xs"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="240">4 hours</option>
            <option value="360">6 hours</option>
            <option value="720">12 hours</option>
            <option value="1440">24 hours</option>
          </select>
        </div>
      ) : null}

      {state.error ? (
        <p className="mt-2 text-sm text-red-500">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-sm text-green-600">{state.success}</p>
      ) : null}

      <Button type="submit" variant="secondary" className="mt-3" disabled={isPending}>
        {isPending ? "Saving..." : "Save rule"}
      </Button>
    </form>
  );
}
