import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BETA_FEEDBACK_FORM_URL,
  BETA_FEEDBACK_PRIVACY_NOTE,
  BETA_FEEDBACK_REPORT_GLITCH_LABEL,
  BETA_FEEDBACK_SUBMIT_LABEL,
  BETA_TESTING_SECTION_TITLE,
} from "@/lib/beta-feedback";
import { SUPPORT_EMAIL } from "@/lib/support-contact";

type BetaFeedbackSectionProps = {
  variant?: "card" | "inline";
};

export function BetaFeedbackSection({ variant = "card" }: BetaFeedbackSectionProps) {
  const content = (
    <>
      <h2 className="text-base font-semibold text-zinc-100">
        {BETA_TESTING_SECTION_TITLE}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Help us improve the private beta. Use demo child info only in your
        feedback.
      </p>
      <p className="mt-3 rounded-lg border border-cub-gold/30 bg-cub-gold-muted/25 px-3 py-2 text-sm text-zinc-300">
        {BETA_FEEDBACK_PRIVACY_NOTE}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          href={BETA_FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button fullWidth className="sm:w-auto">
            {BETA_FEEDBACK_SUBMIT_LABEL}
          </Button>
        </a>
        <a
          href={BETA_FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" fullWidth className="sm:w-auto">
            {BETA_FEEDBACK_REPORT_GLITCH_LABEL}
          </Button>
        </a>
      </div>
      <div className="mt-4 rounded-lg border border-cub-charcoal/80 bg-cub-charcoal/40 px-3 py-3 text-sm text-zinc-400">
        <p className="font-medium text-zinc-300">Request Data Deletion</p>
        <p className="mt-1">
          To request deletion of your beta account/data, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-cub-gold hover:text-cub-gold-light"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    </>
  );

  if (variant === "inline") {
    return <div>{content}</div>;
  }

  return <Card variant="accent">{content}</Card>;
}
