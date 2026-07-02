import type { Metadata } from "next";
import {
  BetaDemoWarning,
  ContactAndDataSection,
} from "@/components/compliance-sections";
import { CompliancePageShell } from "@/components/compliance-page-shell";

export const metadata: Metadata = {
  title: "Privacy · The CUB Code",
  description:
    "How The CUB Code handles information during the private beta — simple summary for parents.",
};

export default function PrivacyPage() {
  return (
    <CompliancePageShell
      title="Privacy summary"
      description="A plain-language overview for the private beta. This is not legal advice."
    >
      <BetaDemoWarning />

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Who this app is for</h2>
        <p>
          The CUB Code helps parents set up tasks, rewards, routines, and progress tracking
          for kids. During beta, parents create and manage accounts. Kids use the app through
          parent-managed profiles.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-medium text-zinc-200">Parent account:</strong> email,
            name, and password (stored securely).
          </li>
          <li>
            <strong className="font-medium text-zinc-200">Family and Cub profiles:</strong>{" "}
            nicknames, colors, tasks, rewards, routines, XP, and progress you enter in the
            app.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">Basic usage data:</strong>{" "}
            information needed to run the service, fix bugs, and improve features during
            beta.
          </li>
        </ul>
        <p>
          We are not asking for extra child data beyond what you need to try the product
          flows. Please keep beta profiles limited to demo details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">How we use information</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Run your account and household features</li>
          <li>Improve and debug the beta</li>
          <li>Respond to support requests</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Children and COPPA</h2>
        <p>
          We design The CUB Code with families in mind, but this private beta is not a
          statement of full COPPA compliance. Parents should supervise use and avoid entering
          real sensitive child information while testing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">How long we keep data</h2>
        <p>
          Beta data may be kept while you use the app and for a reasonable period afterward
          so we can support the beta. You can ask us to delete your data at any time.
        </p>
      </section>

      <ContactAndDataSection />
    </CompliancePageShell>
  );
}
