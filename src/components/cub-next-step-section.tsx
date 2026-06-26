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
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            actionable ? "text-cub-gold-warm" : "text-cub-gold-light",
          )}
        >
          {actionable ? "⚡ Start here" : "🎯 Next step"}
        </p>
        <h2
          className={cn(
            "mt-1 font-black text-cub-off-white",
            actionable ? "text-xl sm:text-2xl" : "text-xl",
          )}
        >
          {action.title}
        </h2>
        <p
          className={cn(
            "mt-2 text-sm",
            actionable ? "text-cub-off-white/90" : "text-cub-muted",
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
            "font-bold uppercase tracking-wide",
            actionable &&
              "shadow-lg shadow-cub-gold/45 ring-2 ring-cub-gold-warm/50 hover:brightness-110",
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
        "relative overflow-hidden rounded-3xl border-2 border-cub-gold-warm",
        "bg-gradient-to-br from-cub-gold-warm/30 via-cub-gold/20 to-cub-charcoal",
        "p-4 shadow-2xl shadow-cub-gold/40 ring-2 ring-cub-gold-warm/55 sm:p-5",
      )}
    >
      <div
        className="pointer-events-none absolute -inset-1 animate-pulse rounded-3xl bg-cub-gold-warm/15 blur-sm"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_0%,rgba(242,193,78,0.35),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(213,160,33,0.25),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-4">{body}</div>
    </div>
  );
}
