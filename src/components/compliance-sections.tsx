import { SUPPORT_EMAIL } from "@/lib/support-contact";

export function BetaDemoWarning() {
  return (
    <div className="rounded-xl border border-cub-gold/35 bg-cub-gold-muted/40 p-4 text-zinc-200">
      <p className="font-semibold text-cub-gold-light">Private beta — use demo info only</p>
      <p className="mt-2">
        During beta, please do not enter real child names, photos, schools, addresses,
        medical details, therapy details, or other sensitive family information. Use
        nicknames and made-up demo details instead.
      </p>
    </div>
  );
}

export function ContactAndDataSection() {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-zinc-100">Questions or delete your data</h2>
      <p>
        Email us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-cub-gold hover:text-cub-gold-light"
        >
          {SUPPORT_EMAIL}
        </a>
        . We can answer questions about the beta or help delete your account and related
        family data.
      </p>
    </section>
  );
}
