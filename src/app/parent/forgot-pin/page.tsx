import { ForgotParentPinForm } from "@/components/forgot-parent-pin-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { maskEmailForDisplay } from "@/lib/parent-pin-reset";
import { safeParentReturnTo } from "@/lib/parent-pin";
import { getFamilyForUser } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

type ForgotParentPinPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function ForgotParentPinPage({
  searchParams,
}: ForgotParentPinPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  if (!family.parentPinHash) {
    redirect("/parent/unlock");
  }

  const { returnTo } = await searchParams;
  const safeReturn = safeParentReturnTo(returnTo);
  const maskedEmail = maskEmailForDisplay(session.user.email ?? "");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-cub-gold">
          Parent area
        </p>
        <h1 className="text-2xl font-bold text-zinc-50">Forgot parent PIN?</h1>
        <p className="text-sm text-zinc-400">
          We&apos;ll send a secure link so you can choose a new PIN.
        </p>
      </div>
      <Card>
        <ForgotParentPinForm maskedEmail={maskedEmail} returnTo={safeReturn} />
      </Card>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Need help?{" "}
        <a
          href="mailto:thecubcode@gmail.com"
          className="font-medium text-cub-gold hover:text-cub-gold/80"
        >
          Email support
        </a>
      </p>
      <Link
        href="/cub"
        className="mt-4 block text-center text-sm font-medium text-zinc-500 hover:text-zinc-300"
      >
        ← Back to Cub view
      </Link>
    </main>
  );
}
