"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  GUARDIAN_NUDGE_RULE_DESCRIPTIONS,
  GUARDIAN_NUDGE_RULE_LABELS,
} from "@/lib/guardian-nudges/types";
import { updateGuardianNudgePreferencesAction } from "@/lib/actions/guardian-nudges";
import type { ActionState } from "@/lib/actions/auth";
import type { GuardianNudgePreferences } from "@/generated/prisma/client";

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
];

function formatSummaryTimeDisplay(hm: string | null): string {
  if (!hm) return "Not set";
  const match = /^(\d{2}):(\d{2})$/.exec(hm);
  if (!match) return hm;
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

type GuardianNudgePreferencesFormProps = {
  preferences: GuardianNudgePreferences;
};

export function GuardianNudgePreferencesForm({
  preferences,
}: GuardianNudgePreferencesFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateGuardianNudgePreferencesAction,
    {} as ActionState,
  );
  const [summaryEnabled, setSummaryEnabled] = useState(
    preferences.dailySummaryEnabled,
  );
  const [summaryTime, setSummaryTime] = useState(
    preferences.dailySummaryTime ?? "08:00",
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-4">
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
            <span className="mt-1 block text-sm text-zinc-500">
              {GUARDIAN_NUDGE_RULE_DESCRIPTIONS.DAILY_SUMMARY}
            </span>
          </span>
        </label>

        <div
          className={
            summaryEnabled ? "mt-4 space-y-3" : "mt-4 space-y-3 pointer-events-none opacity-50"
          }
        >
          <div>
            <Label htmlFor="dailySummaryTime">Your summary time</Label>
            <p className="mt-1 text-xs text-zinc-500">
              Pick any time that fits your household. After this time, your first
              Dashboard visit each day can show one summary card. Saved as{" "}
              <span className="text-zinc-300">
                {formatSummaryTimeDisplay(preferences.dailySummaryTime)}
              </span>{" "}
              ({preferences.timezone.replace(/_/g, " ")}).
            </p>
            <input
              id="dailySummaryTime"
              name="dailySummaryTime"
              type="time"
              value={summaryTime}
              onChange={(event) => setSummaryTime(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-zinc-800 pt-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">Quiet hours</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Hide nudge cards during these hours. Review and tasks are not
            affected. Leave both blank to show nudges any time.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quietHoursStart">Start</Label>
            <input
              id="quietHoursStart"
              name="quietHoursStart"
              type="time"
              defaultValue={preferences.quietHoursStart ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="quietHoursEnd">End</Label>
            <input
              id="quietHoursEnd"
              name="quietHoursEnd"
              type="time"
              defaultValue={preferences.quietHoursEnd ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={preferences.timezone}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Used for quiet hours and daily summary time.
          </p>
        </div>
      </div>

      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-600">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? "Saving..." : "Save Guardian Nudge preferences"}
      </Button>
    </form>
  );
}
