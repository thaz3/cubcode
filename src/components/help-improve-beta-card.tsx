import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BETA_FEEDBACK_FORM_URL,
  BETA_FEEDBACK_GIVE_LABEL,
  BETA_FEEDBACK_PRIVACY_NOTE,
  BETA_FEEDBACK_REPORT_GLITCH_LABEL,
  HELP_IMPROVE_BETA_TITLE,
} from "@/lib/beta-feedback";

export function HelpImproveBetaCard() {
  return (
    <Card variant="accent">
      <h2 className="text-base font-semibold text-zinc-100">
        {HELP_IMPROVE_BETA_TITLE}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Your feedback helps us fix glitches and shape the app before launch.
      </p>
      <p className="mt-3 rounded-lg border border-cub-gold/30 bg-cub-gold-muted/25 px-3 py-2 text-sm text-zinc-300">
        {BETA_FEEDBACK_PRIVACY_NOTE}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={BETA_FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button fullWidth className="sm:w-auto">
            {BETA_FEEDBACK_GIVE_LABEL}
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
    </Card>
  );
}
