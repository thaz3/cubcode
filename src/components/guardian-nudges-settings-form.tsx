"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateGuardianNudgesSettingsAction } from "@/lib/actions/guardian-nudges";
import type { ActionState } from "@/lib/actions/auth";
import {
  GUARDIAN_NUDGE_RULE_DESCRIPTIONS,
  GUARDIAN_NUDGE_RULE_LABELS,
  GUARDIAN_NUDGE_SETTINGS_ORDER,
} from "@/lib/guardian-nudges/types";
import type {
  GuardianNudgePreferences,
  GuardianNudgeRule,
  GuardianNudgeRuleType,
} from "@/generated/prisma/client";

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
];

const OFFSET_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
  { value: "360", label: "6 hours" },
  { value: "720", label: "12 hours" },
  { value: "1440", label: "1 day" },
];

const TIMING_RULES = new Set<GuardianNudgeRuleType>([
  "NOT_STARTED_BEFORE_DUE",
  "NOT_TOUCHED_AFTER_ASSIGN",
]);

function timingLabel(type: GuardianNudgeRuleType): string {
  if (type === "NOT_STARTED_BEFORE_DUE") {
    return "How far ahead?";
  }
  return "How long to wait?";
}

type GuardianNudgesSettingsFormProps = {
  rules: GuardianNudgeRule[];
  preferences: GuardianNudgePreferences;
};

export function GuardianNudgesSettingsForm({
  rules,
  preferences,
}: GuardianNudgesSettingsFormProps) {
  const ruleByType = useMemo(
    () => new Map(rules.map((rule) => [rule.type, rule])),
    [rules],
  );

  const [state, formAction, isPending] = useActionState(
    updateGuardianNudgesSettingsAction,
    {} as ActionState,
  );

  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        GUARDIAN_NUDGE_SETTINGS_ORDER.map((type) => [
          type,
          ruleByType.get(type)?.enabled ?? false,
        ]),
      ),
  );

  const [summaryEnabled, setSummaryEnabled] = useState(
    preferences.dailySummaryEnabled,
  );
  const [summaryTime, setSummaryTime] = useState(
    preferences.dailySummaryTime ?? "08:00",
  );
  const [showQuietHours, setShowQuietHours] = useState(
    Boolean(preferences.quietHoursStart && preferences.quietHoursEnd),
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-zinc-100">
          When should we remind you?
        </legend>
        <p className="text-sm text-zinc-500">
          Gentle in-app reminders for you only. You decide what to do next.
        </p>

        <ul className="divide-y divide-zinc-800 rounded-xl border border-cub-off-white/10 bg-cub-ebony/40">
          {GUARDIAN_NUDGE_SETTINGS_ORDER.map((type) => {
            const rule = ruleByType.get(type);
            const enabled = enabledRules[type] ?? rule?.enabled ?? false;

            return (
              <li key={type} className="p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name={`rule_${type}_enabled`}
                    checked={enabled}
                    onChange={(event) =>
                      setEnabledRules((current) => ({
                        ...current,
                        [type]: event.target.checked,
                      }))
                    }
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-zinc-100">
                      {GUARDIAN_NUDGE_RULE_LABELS[type]}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-500">
                      {GUARDIAN_NUDGE_RULE_DESCRIPTIONS[type]}
                    </span>
                  </span>
                </label>

                {TIMING_RULES.has(type) && enabled ? (
                  <div className="mt-3 pl-7">
                    <Label
                      htmlFor={`rule_${type}_offsetMinutes`}
                      className="text-sm text-zinc-400"
                    >
                      {timingLabel(type)}
                    </Label>
                    <select
                      id={`rule_${type}_offsetMinutes`}
                      name={`rule_${type}_offsetMinutes`}
                      defaultValue={String(rule?.offsetMinutes ?? 120)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm sm:max-w-xs"
                    >
                      {OFFSET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-cub-off-white/10 bg-cub-ebony/40 p-4">
        <legend className="px-1 text-sm font-medium text-zinc-100">
          Optional extras
        </legend>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="dailySummaryEnabled"
            checked={summaryEnabled}
            onChange={(event) => setSummaryEnabled(event.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-100">
              {GUARDIAN_NUDGE_RULE_LABELS.DAILY_SUMMARY}
            </span>
            <span className="mt-0.5 block text-sm text-zinc-500">
              {GUARDIAN_NUDGE_RULE_DESCRIPTIONS.DAILY_SUMMARY}
            </span>
          </span>
        </label>

        {summaryEnabled ? (
          <div className="pl-7">
            <Label htmlFor="dailySummaryTime" className="text-sm text-zinc-400">
              What time works for you?
            </Label>
            <input
              id="dailySummaryTime"
              name="dailySummaryTime"
              type="time"
              value={summaryTime}
              onChange={(event) => setSummaryTime(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
        ) : null}

        <div className="border-t border-cub-off-white/10 pt-3">
          <button
            type="button"
            onClick={() => setShowQuietHours((open) => !open)}
            className="text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            {showQuietHours ? "Hide quiet hours" : "Pause reminders overnight"}
          </button>

          {showQuietHours ? (
            <div className="mt-3 space-y-3 pl-0 sm:pl-1">
              <p className="text-sm text-zinc-500">
                Hide reminder cards during sleep hours. You can still review
                tasks anytime.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="quietHoursStart" className="text-sm">
                    From
                  </Label>
                  <input
                    id="quietHoursStart"
                    name="quietHoursStart"
                    type="time"
                    defaultValue={preferences.quietHoursStart ?? ""}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="quietHoursEnd" className="text-sm">
                    Until
                  </Label>
                  <input
                    id="quietHoursEnd"
                    name="quietHoursEnd"
                    type="time"
                    defaultValue={preferences.quietHoursEnd ?? ""}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="timezone" className="text-sm">
                  Your time zone
                </Label>
                <select
                  id="timezone"
                  name="timezone"
                  defaultValue={preferences.timezone}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <input
                type="hidden"
                name="quietHoursStart"
                value={preferences.quietHoursStart ?? ""}
              />
              <input
                type="hidden"
                name="quietHoursEnd"
                value={preferences.quietHoursEnd ?? ""}
              />
              <input
                type="hidden"
                name="timezone"
                value={preferences.timezone}
              />
            </>
          )}
        </div>
      </fieldset>

      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-600">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? "Saving..." : "Save reminders"}
      </Button>
    </form>
  );
}
