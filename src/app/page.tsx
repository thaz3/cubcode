import Link from "next/link";
import { redirect } from "next/navigation";
import { ComplianceFooter } from "@/components/compliance-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/cub");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-4 py-16">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-cub-gold">
          Control · Use · Build
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          C.U.B. Code
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400">
          Replace screen-time battles with real-world tasks, focus, proof, and
          parent approval.{" "}
          <strong className="font-medium text-zinc-200">
            Earned digital freedom, parent-controlled access.
          </strong>
        </p>

        <Card className="max-w-2xl" variant="accent">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cub-gold/80">
            The household loop
          </h2>
          <p className="mt-2 text-base text-zinc-200">
            Task → Focus → Proof → Approval → Earned Digital Freedom
          </p>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="sm:flex-1">
            <Button fullWidth size="lg">
              Create parent account
            </Button>
          </Link>
          <Link href="/login" className="sm:flex-1">
            <Button variant="secondary" fullWidth size="lg">
              Log in
            </Button>
          </Link>
        </div>

        <ComplianceFooter />
      </div>
    </main>
  );
}
