import Link from "next/link";
import { GuardianNudgeDismissButton } from "@/components/guardian-nudge-dismiss-button";
import { GuardianNudgeSeenButton } from "@/components/guardian-nudge-seen-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GuardianNudge, GuardianNudgeRuleType } from "@/generated/prisma/client";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { isGuardianNudgeDismissAllowed } from "@/lib/guardian-nudges/rule-state";
import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import { cn } from "@/lib/utils";

type NudgeWithRelations = GuardianNudge & {
  task: { id: string; title: string; status: string; isUrgent: boolean } | null;
  cub: { id: string; displayName: string } | null;
};

function nudgeHref(nudge: NudgeWithRelations): string {
  if (nudge.type === "DAILY_SUMMARY") {
    return "/dashboard";
  }
  if (nudge.task?.status === "SUBMITTED") {
    return `/dashboard/tasks/review/${nudge.task.id}`;
  }
  if (nudge.taskId) {
    return `/dashboard/tasks/${nudge.taskId}`;
  }
  return "/dashboard";
}

function nudgeLabel(type: GuardianNudgeRuleType): string {
  switch (type) {
    case "NOT_TOUCHED_AFTER_ASSIGN":
      return "No action";
    case "NOT_STARTED_BEFORE_DUE":
      return "Due soon";
    case "OVERDUE_NOT_STARTED":
      return "Overdue";
    case "SUBMITTED_FOR_REVIEW":
      return "Review";
    case "DAILY_SUMMARY":
      return "Summary";
    default:
      return "Nudge";
  }
}

const NUDGE_ACCENT: Record<
  GuardianNudgeRuleType,
  { card: string; badge: string; cta: "primary" | "secondary" }
> = {
  SUBMITTED_FOR_REVIEW: {
    card: "border-emerald-700/50 bg-emerald-950/25",
    badge: "bg-emerald-900/80 text-emerald-200 ring-emerald-700/50",
    cta: "primary",
  },
  OVERDUE_NOT_STARTED: {
    card: "border-red-800/50 bg-red-950/25",
    badge: "bg-red-900/80 text-red-200 ring-red-700/50",
    cta: "primary",
  },
  NOT_STARTED_BEFORE_DUE: {
    card: "border-amber-800/50 bg-amber-950/25",
    badge: "bg-amber-900/80 text-amber-200 ring-amber-700/50",
    cta: "secondary",
  },
  NOT_TOUCHED_AFTER_ASSIGN: {
    card: "border-violet-700/50 bg-violet-950/30",
    badge: "bg-violet-900/80 text-violet-200 ring-violet-600/50",
    cta: "secondary",
  },
  DAILY_SUMMARY: {
    card: "border-indigo-700/50 bg-indigo-950/25",
    badge: "bg-indigo-900/80 text-indigo-200 ring-indigo-700/50",
    cta: "secondary",
  },
};

type GuardianNudgesSectionProps = {
  nudges: NudgeWithRelations[];
  hiddenByQuietHours?: boolean;
};

export function GuardianNudgesSection({
  nudges,
  hiddenByQuietHours = false,
}: GuardianNudgesSectionProps) {
  if (nudges.length === 0) {
    return null;
  }

  const unseenCount = nudges.filter((nudge) => nudge.status === "ACTIVE").length;

  return (
    <section id="small-reminders" className="scroll-mt-4">
      <Card className="overflow-hidden border-violet-700/60 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-950 p-0 shadow-lg shadow-violet-950/20 ring-1 ring-violet-500/25">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-violet-800/50 bg-violet-950/50 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {unseenCount > 0 ? (
                <span
                  className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-violet-400"
                  aria-hidden
                />
              ) : null}
              <h2 className="text-lg font-bold tracking-tight text-violet-100">
                {SMALL_REMINDERS_LABEL}
              </h2>
              {unseenCount > 0 ? (
                <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {unseenCount} new
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-sm text-violet-200/75">
              A quick heads-up — you decide what happens next.
            </p>
          </div>
          <Link
            href="/dashboard/family/settings"
            className="shrink-0 text-xs font-medium text-violet-400 hover:text-violet-300"
          >
            Settings →
          </Link>
        </div>

        <div className="space-y-3 p-4">
          {hiddenByQuietHours ? (
            <div className="rounded-xl border border-violet-800/40 bg-violet-950/30 px-4 py-4">
              <p className="text-sm font-medium text-violet-100">
                {nudges.length} nudge{nudges.length === 1 ? "" : "s"} waiting
              </p>
              <p className="mt-1 text-sm text-violet-200/70">
                Quiet hours are on. Nudges will appear here when quiet hours end.
                Review and tasks are not affected.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {nudges.map((nudge) => {
                const accent = NUDGE_ACCENT[nudge.type];
                const isNew = nudge.status === "ACTIVE";

                return (
                  <li key={nudge.id}>
                    <div
                      className={cn(
                        "rounded-xl border p-4 shadow-sm",
                        accent.card,
                        isNew && "ring-2 ring-violet-500/30",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1",
                              accent.badge,
                            )}
                          >
                            {nudgeLabel(nudge.type)}
                          </span>
                          {nudge.task?.isUrgent ? <TaskUrgentBadge /> : null}
                          <p className="text-base font-medium leading-snug text-zinc-50">
                            {nudge.message}
                          </p>
                        </div>
                        {isGuardianNudgeDismissAllowed(nudge.type) ? (
                          <GuardianNudgeDismissButton nudgeId={nudge.id} />
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link href={nudgeHref(nudge)}>
                          <Button size="sm" variant={accent.cta}>
                            {nudge.type === "SUBMITTED_FOR_REVIEW"
                              ? "Review now"
                              : "View task"}
                          </Button>
                        </Link>
                        {isNew ? (
                          <GuardianNudgeSeenButton nudgeId={nudge.id} />
                        ) : (
                          <span className="text-xs text-zinc-500">Seen</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </section>
  );
}
