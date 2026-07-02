import Link from "next/link";
import { ComplianceFooter } from "@/components/compliance-footer";
import { Card } from "@/components/ui/card";

type CompliancePageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function CompliancePageShell({
  title,
  description,
  children,
}: CompliancePageShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-12 pb-nav-safe">
      <div className="mb-8 space-y-3">
        <Link
          href="/"
          className="inline-block text-sm font-bold text-cub-gold hover:text-cub-gold-light"
        >
          ← The CUB Code
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{title}</h1>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      <Card className="prose-cub space-y-6 text-sm leading-relaxed text-zinc-300">
        {children}
      </Card>

      <div className="mt-10">
        <ComplianceFooter />
      </div>
    </main>
  );
}
