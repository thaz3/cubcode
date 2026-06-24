"use client";

import type { AgeBand, SupervisionLevel } from "@/generated/prisma/client";
import { AGE_BAND_OPTIONS } from "@/lib/age-band-defaults";
import { getCubProfileSuggestionsFromAgeBand } from "@/lib/template-suggestions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAgeBand } from "@/lib/age-band-defaults";
import { useActionState, useMemo, useState } from "react";
import type { ActionState } from "@/lib/actions/auth";

const SUPERVISION_OPTIONS: Array<{
  value: SupervisionLevel;
  label: string;
}> = [
  { value: "DIRECT", label: "Direct (parent nearby)" },
  { value: "NEARBY", label: "Nearby (parent in home/area)" },
  { value: "INDEPENDENT", label: "Independent (check-ins)" },
];

type CubFormProps = {
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  initialValues?: {
    displayName: string;
    ageBand: AgeBand;
    focusMinutesEarned: number;
    phoneMinutesEarned: number;
    xpEarned: number;
    focusTokensEarned: number;
    dailyPhoneCapMinutes: number;
    weekendBankCapMinutes: number;
    supervisionLevel: SupervisionLevel;
  };
  submitLabel: string;
};

export function CubForm({
  action,
  initialValues,
  submitLabel,
}: CubFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [ageBand, setAgeBand] = useState<AgeBand>(
    initialValues?.ageBand ?? "CORE_CUBS",
  );

  const bandDefaults = useMemo(
    () => getCubProfileSuggestionsFromAgeBand(ageBand),
    [ageBand],
  );

  const [focusMinutesEarned, setFocusMinutesEarned] = useState(
    String(
      initialValues?.focusMinutesEarned ?? bandDefaults.focusMinutesEarned,
    ),
  );
  const [phoneMinutesEarned, setPhoneMinutesEarned] = useState(
    String(
      initialValues?.phoneMinutesEarned ?? bandDefaults.phoneMinutesEarned,
    ),
  );
  const [xpEarned, setXpEarned] = useState(
    String(initialValues?.xpEarned ?? bandDefaults.xpEarned),
  );
  const [focusTokensEarned, setFocusTokensEarned] = useState(
    String(initialValues?.focusTokensEarned ?? bandDefaults.focusTokensEarned),
  );
  const [dailyPhoneCapMinutes, setDailyPhoneCapMinutes] = useState(
    String(
      initialValues?.dailyPhoneCapMinutes ?? bandDefaults.dailyPhoneCapMinutes,
    ),
  );
  const [weekendBankCapMinutes, setWeekendBankCapMinutes] = useState(
    String(
      initialValues?.weekendBankCapMinutes ??
        bandDefaults.weekendBankCapMinutes,
    ),
  );
  const [supervisionLevel, setSupervisionLevel] = useState<SupervisionLevel>(
    initialValues?.supervisionLevel ?? bandDefaults.supervisionLevel,
  );
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  function applySuggestedSettings() {
    const s = getCubProfileSuggestionsFromAgeBand(ageBand);
    setFocusMinutesEarned(String(s.focusMinutesEarned));
    setPhoneMinutesEarned(String(s.phoneMinutesEarned));
    setXpEarned(String(s.xpEarned));
    setFocusTokensEarned(String(s.focusTokensEarned));
    setDailyPhoneCapMinutes(String(s.dailyPhoneCapMinutes));
    setWeekendBankCapMinutes(String(s.weekendBankCapMinutes));
    setSupervisionLevel(s.supervisionLevel);
    setSettingsMessage(
      `Suggested settings applied for ${formatAgeBand(ageBand)}. You can edit any field.`,
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="displayName">Cub display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={initialValues?.displayName ?? ""}
          placeholder="Jordan"
          required
        />
      </div>

      <input type="hidden" name="ageBand" value={ageBand} />
      <input type="hidden" name="supervisionLevel" value={supervisionLevel} />

      <Card className="space-y-5 bg-amber-50/40 dark:bg-amber-950/20">
        <div>
          <h3 className="text-sm font-semibold">Settings for this Cub</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Age band, earned rewards per approved task, phone caps, and
            supervision. Proof style is set on each task template.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Age band</p>
          <div className="grid gap-2">
            {AGE_BAND_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <input
                  type="radio"
                  checked={ageBand === option.value}
                  onChange={() => setAgeBand(option.value)}
                  className="accent-amber-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-amber-200/80 pt-4 dark:border-amber-900">
          <Button type="button" variant="secondary" onClick={applySuggestedSettings}>
            Use suggested settings
          </Button>
          {settingsMessage ? (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              {settingsMessage}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <h4 className="text-sm font-medium">Rewards on parent approval</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              When you approve a completed task for this Cub, they earn these
              amounts. Proof style is configured on each task.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="focusMinutesEarned">Focus minutes earned</Label>
              <Input
                id="focusMinutesEarned"
                name="focusMinutesEarned"
                type="number"
                min={0}
                max={240}
                required
                value={focusMinutesEarned}
                onChange={(e) => setFocusMinutesEarned(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phoneMinutesEarned">Phone time earned</Label>
              <Input
                id="phoneMinutesEarned"
                name="phoneMinutesEarned"
                type="number"
                min={0}
                max={480}
                required
                value={phoneMinutesEarned}
                onChange={(e) => setPhoneMinutesEarned(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="xpEarned">XP earned</Label>
              <Input
                id="xpEarned"
                name="xpEarned"
                type="number"
                min={0}
                max={10000}
                required
                value={xpEarned}
                onChange={(e) => setXpEarned(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="focusTokensEarned">Focus Tokens earned</Label>
              <Input
                id="focusTokensEarned"
                name="focusTokensEarned"
                type="number"
                min={0}
                max={100}
                required
                value={focusTokensEarned}
                onChange={(e) => setFocusTokensEarned(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dailyPhoneCapMinutes">Daily phone cap (minutes)</Label>
            <Input
              id="dailyPhoneCapMinutes"
              name="dailyPhoneCapMinutes"
              type="number"
              min={0}
              required
              value={dailyPhoneCapMinutes}
              onChange={(e) => setDailyPhoneCapMinutes(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="weekendBankCapMinutes">Weekend bank cap (minutes)</Label>
            <Input
              id="weekendBankCapMinutes"
              name="weekendBankCapMinutes"
              type="number"
              min={0}
              required
              value={weekendBankCapMinutes}
              onChange={(e) => setWeekendBankCapMinutes(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="supervisionLevel">Supervision level</Label>
          <select
            id="supervisionLevel"
            value={supervisionLevel}
            onChange={(e) =>
              setSupervisionLevel(e.target.value as SupervisionLevel)
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {SUPERVISION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
