import Link from "next/link";
import { BETA_FEEDBACK_LABEL, BETA_FEEDBACK_PATH } from "@/lib/beta-feedback";

const links = [
  { href: BETA_FEEDBACK_PATH, label: BETA_FEEDBACK_LABEL },
  { href: "/beta", label: "Beta notice" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function ComplianceFooter() {
  return (
    <footer className="border-t border-cub-charcoal/80 pt-6 text-center">
      <div className="mx-auto max-w-md rounded-xl border border-cub-gold/40 bg-cub-gold-muted/35 px-4 py-3 text-sm text-zinc-200">
        <p className="font-semibold text-cub-gold-light">Private beta</p>
        <p className="mt-1">
          The CUB Code is in private beta. Use demo child info only.
        </p>
      </div>
      <nav aria-label="Legal and beta information" className="mt-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-medium text-zinc-400 transition hover:text-cub-gold"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
