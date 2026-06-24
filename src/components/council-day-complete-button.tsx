"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { completeCouncilDayAction } from "@/lib/actions/council-day";

type CouncilDayCompleteButtonProps = {
  sessionId: string;
  allCubsReady: boolean;
};

export function CouncilDayCompleteButton({
  sessionId,
  allCubsReady,
}: CouncilDayCompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleComplete() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await completeCouncilDayAction(sessionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.success ?? `${FAMILY_DAY_LABEL} complete.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {!allCubsReady ? (
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Save complete notes, ratings, and bonuses for every Cub before
          finishing {FAMILY_DAY_LABEL}.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
      ) : null}
      <Button
        type="button"
        onClick={handleComplete}
        disabled={isPending || !allCubsReady}
      >
        {isPending ? "Completing..." : `Complete ${FAMILY_DAY_LABEL} & credit bonuses`}
      </Button>
    </div>
  );
}
