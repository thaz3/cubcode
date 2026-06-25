"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resetFamilyDaySessionAction } from "@/lib/actions/council-day";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

type FamilyDayResetButtonProps = {
  sessionId: string;
  wasComplete: boolean;
};

export function FamilyDayResetButton({
  sessionId,
  wasComplete,
}: FamilyDayResetButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReset() {
    const message = wasComplete
      ? `Erase this week's ${FAMILY_DAY_LABEL} and reverse bonuses? All notes and ratings will be deleted.`
      : `Erase this week's ${FAMILY_DAY_LABEL} and start over? All saved notes and ratings will be deleted.`;

    if (!window.confirm(message)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await resetFamilyDaySessionAction(sessionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-cub-off-white/10">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Start over
      </p>
      <p className="text-sm text-zinc-500">
        Wrong answers or need a do-over? Erase this week&apos;s {FAMILY_DAY_LABEL}
        {wasComplete ? " and reverse credited bonuses" : ""}.
      </p>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <Button
        type="button"
        variant="danger"
        onClick={handleReset}
        disabled={isPending}
      >
        {isPending ? "Erasing..." : `Erase ${FAMILY_DAY_LABEL}`}
      </Button>
    </div>
  );
}
