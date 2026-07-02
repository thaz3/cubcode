import type { Metadata } from "next";
import {
  BetaDemoWarning,
  ContactAndDataSection,
} from "@/components/compliance-sections";
import { CompliancePageShell } from "@/components/compliance-page-shell";

export const metadata: Metadata = {
  title: "Beta notice · The CUB Code",
  description:
    "Private beta guidelines for The CUB Code — use demo child info while testing tasks, rewards, and routines.",
};

export default function BetaPage() {
  return (
    <CompliancePageShell
      title="Private beta notice"
      description="Last updated for the early private beta. Plain language, not legal advice."
    >
      <BetaDemoWarning />

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">What this beta is for</h2>
        <p>
          The CUB Code is an early private beta for parents and kids to try task, reward,
          routine, XP, and growth-chart flows. We are learning what works before a wider
          release.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">What to use instead of real info</h2>
        <ul className="list-disc space-y-1 pl-5 text-zinc-300">
          <li>Nicknames like &ldquo;Cub One&rdquo; or &ldquo;Demo Kid&rdquo;</li>
          <li>Made-up task and reward names</li>
          <li>Placeholder text instead of school, address, or health details</li>
          <li>No real photos of children</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">What we are not doing yet</h2>
        <p>
          This beta is not a finished kids&apos; product. We are not claiming full COPPA
          compliance or a complete children&apos;s privacy program. We are building carefully
          and will share clearer policies as the product matures.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-100">Beta may change or reset</h2>
        <p>
          Features may break, change, or disappear during testing. We may reset or delete
          beta data as we improve the app. Do not rely on this beta for important records.
        </p>
      </section>

      <ContactAndDataSection />
    </CompliancePageShell>
  );
}
