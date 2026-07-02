import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceFooter } from "@/components/compliance-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  BETA_FEEDBACK_DEVICE_TIPS,
  BETA_FEEDBACK_FORM_URL,
  BETA_FEEDBACK_LABEL,
  BETA_FEEDBACK_PRIVACY_NOTE,
} from "@/lib/beta-feedback";

export const metadata: Metadata = {
  title: "Beta feedback · The CUB Code",
  description:
    "Report a glitch or share confusion while testing The CUB Code private beta.",
};

export default async function FeedbackPage() {
  const session = await auth();
  const backHref = session?.user ? "/dashboard" : "/";
  const backLabel = session?.user ? "Dashboard" : "Home";

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-12 pb-nav-safe">
      <div className="mb-8 space-y-3">
        <Link
          href={backHref}
          className="inline-block text-sm font-bold text-cub-gold hover:text-cub-gold-light"
        >
          ← {backLabel}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {BETA_FEEDBACK_LABEL}
        </h1>
        <p className="text-sm text-zinc-400">
          Help us improve the private beta. This opens a simple Google Form — no
          full bug tracker yet.
        </p>
      </div>

      <Card className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-100">What to send us</h2>
          <ul className="list-disc space-y-1 pl-5">
            {BETA_FEEDBACK_DEVICE_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-100">
            Finding your device and browser
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="font-medium text-zinc-200">iPhone / iPad:</strong>{" "}
              Settings → General → About → Model Name. Browser is usually Safari.
            </li>
            <li>
              <strong className="font-medium text-zinc-200">Android:</strong> Settings
              → About phone. Note whether you use Chrome or another browser.
            </li>
            <li>
              <strong className="font-medium text-zinc-200">Computer:</strong> Include
              Mac or Windows and your browser name (Chrome, Safari, Edge, Firefox).
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-cub-gold/35 bg-cub-gold-muted/35 px-4 py-3 text-zinc-200">
          <p className="font-semibold text-cub-gold-light">Keep beta info private</p>
          <p className="mt-2">{BETA_FEEDBACK_PRIVACY_NOTE}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={BETA_FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer">
            <Button fullWidth size="lg">
              Open beta feedback form
            </Button>
          </a>
          {session?.user ? (
            <Link href="/dashboard/family/settings">
              <Button variant="secondary" fullWidth size="lg">
                Back to settings
              </Button>
            </Link>
          ) : null}
        </div>
      </Card>

      <div className="mt-10">
        <ComplianceFooter />
      </div>
    </main>
  );
}
