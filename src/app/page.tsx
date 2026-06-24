import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-16">
      <div className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
          Control · Use · Build
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          C.U.B. Code
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Replace screen-time battles with real-world tasks, focus, proof, and
          parent approval.{" "}
          <strong className="font-medium text-zinc-900 dark:text-zinc-100">
            C.U.B. Code calculates earned digital freedom. Parents control
            access.
          </strong>
        </p>

        <Card className="max-w-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Household loop
          </h2>
          <p className="mt-2 text-base">
            Task → Focus → Proof → Approval → Earned Digital Freedom
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href="/signup">
            <Button>Create parent account</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
