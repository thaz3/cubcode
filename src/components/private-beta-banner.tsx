import {
  BETA_FEEDBACK_FORM_URL,
  BETA_FEEDBACK_REPORT_GLITCH_LABEL,
} from "@/lib/beta-feedback";
import { cubKidTipCard } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type PrivateBetaBannerProps = {
  variant?: "parent" | "kid";
  className?: string;
};

export function PrivateBetaBanner({
  variant = "parent",
  className,
}: PrivateBetaBannerProps) {
  const reportLink = (
    <a
      href={BETA_FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "font-medium underline underline-offset-2 transition",
        variant === "parent"
          ? "text-cub-gold hover:text-cub-gold-light"
          : "text-kid-purple hover:text-kid-purple/80",
      )}
    >
      Report it here
    </a>
  );

  if (variant === "kid") {
    return (
      <p
        className={cn(cubKidTipCard, "text-xs text-kid-ink-muted", className)}
        role="note"
      >
        <span className="font-black text-kid-ink">Private Beta</span>
        {" — "}
        Use fake/demo child info only. Found a glitch? {reportLink}.
      </p>
    );
  }

  return (
    <p
      className={cn(
        "rounded-xl border border-cub-gold/30 bg-cub-gold-muted/25 px-3 py-2 text-sm text-zinc-300",
        className,
      )}
      role="note"
    >
      <span className="font-medium text-cub-gold-light">Private Beta</span>
      {" — "}
      Use fake/demo child info only. Found a glitch? {reportLink}.
      <span className="sr-only"> ({BETA_FEEDBACK_REPORT_GLITCH_LABEL})</span>
    </p>
  );
}
