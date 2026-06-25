import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";

export default async function CubPickerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  if (family.cubs.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <EmptyState
          title="No Cubs yet"
          description="Add a Cub profile in the parent area first."
          actionLabel="Parent area (PIN required)"
          actionHref="/parent/unlock?returnTo=%2Fdashboard%2Fcubs%2Fnew"
        />
      </main>
    );
  }

  if (family.cubs.length === 1) {
    redirect(`/cub/${family.cubs[0]!.id}`);
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-16 pb-nav-safe">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
          Cub view
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-50">Who is using this device?</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Pick your profile. Parents can switch back anytime.
        </p>
      </div>
      <ul className="space-y-3">
        {family.cubs.map((cub) => (
          <li key={cub.id}>
            <Link href={`/cub/${cub.id}`}>
              <Card variant="interactive" className="text-center">
                <p className="text-lg font-semibold text-zinc-50">
                  {cub.displayName}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/parent/unlock?returnTo=%2Fdashboard" className="block">
        <Button variant="secondary" fullWidth size="lg">
          Parent area
        </Button>
      </Link>
    </main>
  );
}
