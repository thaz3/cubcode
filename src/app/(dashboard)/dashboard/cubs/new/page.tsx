import { CubForm } from "@/components/cub-form";
import { Card } from "@/components/ui/card";
import { createCubAction } from "@/lib/actions/cub";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewCubPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/cubs"
          className="text-sm font-medium text-amber-700"
        >
          ← Back to Cubs
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Add Cub</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Choose an age band to see defaults, then use suggested caps if you
          want them applied to household rules.
        </p>
      </div>

      <Card>
        <CubForm action={createCubAction} submitLabel="Create Cub profile" />
      </Card>
    </div>
  );
}
