import Link from "next/link";
import { ParentPinUnlockForm } from "@/components/parent-pin-unlock-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  isParentAreaUnlocked,
  safeParentReturnTo,
} from "@/lib/parent-pin";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

type ParentUnlockPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function ParentUnlockPage({
  searchParams,
}: ParentUnlockPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const { returnTo } = await searchParams;
  const safeReturn = safeParentReturnTo(returnTo);

  // No PIN configured — parent area is not gated.
  if (!family.parentPinHash) {
    redirect(safeReturn);
  }

  if (await isParentAreaUnlocked(session.user.id, family.id)) {
    redirect(safeReturn);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
          Parent area
        </p>
        <h1 className="text-2xl font-bold text-zinc-50">Enter parent PIN</h1>
        <p className="text-sm text-zinc-400">
          This keeps kids out of settings and approvals on a shared device.
        </p>
      </div>
      <Card>
        <ParentPinUnlockForm returnTo={safeReturn} />
      </Card>
      <Link
        href="/cub"
        className="mt-6 block text-center text-sm font-medium text-zinc-500 hover:text-zinc-300"
      >
        ← Back to Cub view
      </Link>
    </main>
  );
}
