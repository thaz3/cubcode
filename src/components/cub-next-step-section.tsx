import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { Button } from "@/components/ui/button";
import type { CubNextAction } from "@/lib/cub-next-action";
import { nextActionButtonVariant } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

type CubNextStepSectionProps = {
  action: CubNextAction;
};

function needsKidAttention(tone: CubNextAction["tone"]): boolean {
  return tone === "focus" || tone === "urgent";
}

export function CubNextStepSection({ action }: CubNextStepSectionProps) {
  const actionable = needsKidAttention(action.tone);
  const buttonVariant = nextActionButtonVariant(
    action.tone === "urgent" ? "urgent" : "normal",
    action.buttonLabel,
  );

  const body = (
    <>
      <div>
        <p
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            actionable ? "text-kid-orange" : "text-kid-purple",
          )}
        >
          {actionable ? "⚡ Let's Go!" : "🎯 Next step"}
        </p>
        <h2
          className={cn(
            "mt-1 font-black text-kid-ink",
            actionable ? "text-xl sm:text-2xl" : "text-xl",
          )}
        >
          {action.title}
        </h2>
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            actionable ? "text-kid-ink-soft" : "text-kid-ink-muted",
          )}
        >
          {action.description}
        </p>
      </div>
      <Link href={action.href}>
        <Button
          fullWidth
          size="lg"
          variant={actionable ? "reward" : buttonVariant}
          className={cn(
            "rounded-2xl font-black uppercase tracking-wide",
            actionable &&
              "shadow-lg shadow-kid-orange/35 ring-2 ring-kid-yellow/60 hover:brightness-110",
          )}
        >
          {action.buttonLabel} ▶
        </Button>
      </Link>
    </>
  );

  if (!actionable) {
    return (
      <CubKidPanel variant="gold" contentClassName="space-y-4">
        {body}
      </CubKidPanel>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-[3px] border-kid-orange/60",
        "bg-gradient-to-br from-kid-yellow/50 via-kid-orange/20 to-white",
        "p-4 shadow-xl shadow-kid-orange/25 ring-2 ring-kid-yellow/40 sm:p-5",
      )}
    >
      <div
        className="pointer-events-none absolute -inset-1 animate-pulse rounded-3xl bg-kid-yellow/20 blur-sm"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_0%,rgba(255,216,77,0.4),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(255,159,67,0.25),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-4">{body}</div>
    </div>
  );
}
