import type { Metadata } from "next";
import {
  BetaDemoWarning,
  ContactAndDataSection,
} from "@/components/compliance-sections";
import { CompliancePageShell } from "@/components/compliance-page-shell";

export const metadata: Metadata = {
  title: "Terms · The CUB Code",
  description:
    "Simple beta terms for using The CUB Code while testing tasks, rewards, and routines.",
};

export default function TermsPage() {
  return (
    <CompliancePageShell
      title="Beta terms of use"
      description="Simple rules for the private beta. This is not legal advice."
    >
      <BetaDemoWarning />

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Agreement</h2>
        <p>
          By creating an account or using The CUB Code during the private beta, you agree to
          these terms and our privacy summary. If you do not agree, please do not use the
          app.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Beta software</h2>
        <p>
          The CUB Code is early test software. It may have bugs, downtime, or incomplete
          features. We provide it &ldquo;as is&rdquo; during beta with no warranty. Use it for
          testing and feedback, not as your only system for managing family routines.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Parent accounts</h2>
        <p>
          Accounts are for parents or legal guardians. You are responsible for your login,
          your household settings, and how kids in your family use the app. Keep your password
          private.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Demo data only during beta</h2>
        <p>
          Do not enter real child names, photos, schools, addresses, medical details, therapy
          details, or other sensitive family information. Use nicknames and made-up demo
          details while we test the product.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Acceptable use</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Do not abuse, attack, or try to break the service</li>
          <li>Do not use the app for unlawful or harmful activity</li>
          <li>Do not upload content you do not have permission to share</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Changes and ending the beta</h2>
        <p>
          We may update these terms, change features, pause access, or end the beta at any
          time. We will try to communicate important changes when we can.
        </p>
      </section>

      <ContactAndDataSection />
    </CompliancePageShell>
  );
}
