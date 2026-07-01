"use client";

import type { AgeBand, GrowthCategory, SupervisionLevel } from "@/generated/prisma/client";
import {
  AGE_BAND_OPTIONS,
  formatAgeBand,
} from "@/lib/age-band-defaults";
import { ALL_GROWTH_CATEGORIES, GROWTH_CATEGORY_LABELS, GROWTH_CATEGORY_TAGLINES } from "@/lib/task-categories";
import { getCubProfileSuggestionsFromAgeBand } from "@/lib/template-suggestions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { useTouchNativeControls } from "@/components/use-prefers-hover";
import { NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";
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
    requiredGrowthCategories?: GrowthCategory[];
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
  const [requiredGrowth, setRequiredGrowth] = useState<GrowthCategory[]>(
    initialValues?.requiredGrowthCategories ?? [...ALL_GROWTH_CATEGORIES],
  );
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const useNativeControls = useTouchNativeControls();

  function toggleGrowthArea(category: GrowthCategory) {
    setRequiredGrowth((current) => {
      if (current.includes(category)) {
        const next = current.filter((item) => item !== category);
        return next.length > 0 ? next : current;
      }
      return [...current, category];
    });
  }

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

      {requiredGrowth.map((category) => (
        <input
          key={category}
          type="hidden"
          name="requiredGrowthCategories"
          value={category}
        />
      ))}

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
          {useNativeControls ? (
            <select
              id="ageBand"
              name="ageBand"
              value={ageBand}
              onChange={(event) => setAgeBand(event.target.value as AgeBand)}
              className={NATIVE_SELECT_CLASS}
              required
            >
              {AGE_BAND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <RadioChoiceList
              name="ageBand"
              value={ageBand}
              onChange={setAgeBand}
              options={AGE_BAND_OPTIONS}
            />
          )}
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
          <p className="mb-2 text-sm font-medium">Supervision level</p>
          {useNativeControls ? (
            <select
              id="supervisionLevel"
              name="supervisionLevel"
              value={supervisionLevel}
              onChange={(event) =>
                setSupervisionLevel(event.target.value as SupervisionLevel)
              }
              className={NATIVE_SELECT_CLASS}
              required
            >
              {SUPERVISION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <RadioChoiceList
              name="supervisionLevel"
              value={supervisionLevel}
              onChange={setSupervisionLevel}
              options={SUPERVISION_OPTIONS}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Required Cub Codes</p>
          <p className="mb-3 text-sm text-zinc-500">
            Your Cub must complete a focus session in each selected Cub Code every
            week to earn full rewards. This keeps growth balanced across all seven areas.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_GROWTH_CATEGORIES.map((category) => {
              const selected = requiredGrowth.includes(category);
              return (
                <label
                  key={category}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleGrowthArea(category)}
                    className="mt-0.5 size-4 shrink-0 accent-amber-600"
                  />
                  <span className="text-sm leading-snug">
                    <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                      {GROWTH_CATEGORY_LABELS[category]}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {GROWTH_CATEGORY_TAGLINES[category]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
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
