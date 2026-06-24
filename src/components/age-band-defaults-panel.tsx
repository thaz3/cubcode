"use client";

import type { AgeBand } from "@/generated/prisma/client";
import {
  AGE_BAND_DEFAULTS,
  AGE_BAND_OPTIONS,
} from "@/lib/age-band-defaults";
import { applySuggestedCapsAction } from "@/lib/actions/family";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";

type AgeBandDefaultsPanelProps = {
  selectedBand: AgeBand;
  onBandChange: (band: AgeBand) => void;
  cubName?: string;
};

export function AgeBandDefaultsPanel({
  selectedBand,
  onBandChange,
  cubName,
}: AgeBandDefaultsPanelProps) {
  const defaults = AGE_BAND_DEFAULTS[selectedBand];
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApplySuggestedCaps() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await applySuggestedCapsAction(selectedBand);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setMessage(result.success);
      }
    });
  }

  return (
    <Card className="space-y-4 bg-amber-50/60 dark:bg-amber-950/20">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Age band
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Defaults update when you change the band.
        </p>
      </div>

      <div className="grid gap-2">
        {AGE_BAND_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <input
              type="radio"
              name="ageBand"
              value={option.value}
              checked={selectedBand === option.value}
              onChange={() => onBandChange(option.value)}
              className="accent-amber-600"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <DefaultItem label="Focus Block length" value={`${defaults.focusBlockMinutes} min`} />
        <DefaultItem label="Proof style" value={defaults.proofStyleLabel} />
        <DefaultItem
          label="Suggested daily phone cap"
          value={`${defaults.suggestedDailyPhoneCapMinutes} min`}
        />
        <DefaultItem
          label="Suggested weekend bank cap"
          value={`${defaults.suggestedWeekendBankCapMinutes} min`}
        />
        <DefaultItem
          label="Suggested exchange"
          value={`${defaults.suggestedExchangeFocusMinutes} min focus → ${defaults.suggestedExchangePhoneMinutes} min phone`}
        />
        <DefaultItem label="Family Day length" value={`${defaults.councilDayMinutes} min`} />
        <DefaultItem
          label="Supervision level"
          value={defaults.supervisionLevelLabel}
        />
      </div>

      <div className="space-y-2 border-t border-amber-200 pt-4 dark:border-amber-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {cubName
            ? `Apply ${defaults.label} suggested caps for the household based on ${cubName}. You can adjust them anytime in Family Settings.`
            : "Apply suggested caps to your household rules. You can adjust them anytime in Family Settings."}
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={handleApplySuggestedCaps}
        >
          {isPending ? "Applying..." : "Use suggested caps"}
        </Button>
        {message ? (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    </Card>
  );
}

function DefaultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
