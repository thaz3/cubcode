import { EarnTypeBadge } from "@/components/earn-type-badge";
import Link from "next/link";
import { ChallengeCheckInForm } from "@/components/challenge-check-in-form";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import type { Challenge, ChallengeProgressLog } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type CubWorkflowRoutineCardProps = {
  cubId: string;
  challenge: Challenge;
  log: ChallengeProgressLog | null;
  intervalLabel: string;
  dueNow?: boolean;
};

export function CubWorkflowRoutineCard({
  cubId,
  challenge,
  log,
  intervalLabel,
  dueNow = true,
}: CubWorkflowRoutineCardProps) {
  const status = log?.status ?? "PENDING";

  return (
    <Card
      className={cn(
        "rounded-2xl border-2 shadow-md",
        cubAccentClassNames(cubId, {
          border: true,
          cardTint: dueNow && status === "PENDING",
        }),
      )}
    >
      <div className="space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <EarnTypeBadge earnType="routine" />
            <h2 className="text-lg font-semibold text-zinc-50">{challenge.title}</h2>
            {log ? <ChallengeProgressBadge status={log.status} /> : null}
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {formatChallengeInterval(challenge.intervalType, challenge.intervalConfig)}
            {intervalLabel ? ` · ${intervalLabel}` : ""}
          </p>
          {challenge.description ? (
            <p className="mt-2 text-sm text-zinc-400">{challenge.description}</p>
          ) : null}
        </div>

        {dueNow && log ? (
          <ChallengeCheckInForm
            challenge={challenge}
            log={log}
            intervalLabel={intervalLabel}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              This routine is not due right now. Check back on the next scheduled day.
            </p>
            <Link href={`/cub/${cubId}/challenges/${challenge.id}`}>
              <Button variant="secondary" fullWidth>
                View routine
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
