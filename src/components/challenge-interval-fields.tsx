"use client";

import type { ChallengeIntervalType } from "@/generated/prisma/client";
import { CUSTOM_DAY_OPTIONS } from "@/lib/challenge-intervals";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { useState } from "react";

const INTERVAL_OPTIONS: Array<{ value: ChallengeIntervalType; label: string }> = [
  { value: "DAILY", label: "Every day" },
  { value: "WEEKDAYS", label: "Weekdays (Mon–Fri)" },
  { value: "WEEKLY", label: "Once per week" },
  { value: "CUSTOM", label: "Specific days" },
];

type ChallengeIntervalFieldsProps = {
  initialIntervalType?: ChallengeIntervalType;
  initialCustomDays?: number[];
};

export function ChallengeIntervalFields({
  initialIntervalType = "DAILY",
  initialCustomDays = [],
}: ChallengeIntervalFieldsProps) {
  const [intervalType, setIntervalType] =
    useState<ChallengeIntervalType>(initialIntervalType);
  const [customDays, setCustomDays] = useState<number[]>(initialCustomDays);

  function toggleDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="intervalType" value={intervalType} />
      {customDays.map((day) => (
        <input key={day} type="hidden" name="customDays" value={day} />
      ))}

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          How often
        </p>
        <RadioChoiceList
          name="intervalTypeChoice"
          options={INTERVAL_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          value={intervalType}
          onChange={(v) => setIntervalType(v as ChallengeIntervalType)}
        />
      </div>

      {intervalType === "CUSTOM" ? (
        <div className="space-y-2">
          <Label>Pick days</Label>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_DAY_OPTIONS.map((day) => {
              const selected = customDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? "border-cub-gold bg-cub-gold-muted text-cub-gold-light"
                      : "border-cub-off-white/15 bg-cub-charcoal text-cub-muted hover:border-cub-off-white/25"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
