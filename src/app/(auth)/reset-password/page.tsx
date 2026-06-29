import { ResetPasswordForm } from "@/components/reset-password-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16 pb-nav-safe">
      <div className="mb-6 space-y-2 text-center">
        <Link href="/" className="text-sm font-bold text-cub-gold">
          C.U.B. Code
        </Link>
        <h1 className="text-2xl font-bold text-zinc-50">Choose a new password</h1>
        <p className="text-sm text-zinc-400">
          Pick a new password for your parent account.
        </p>
      </div>
      <Card>
        <ResetPasswordForm token={token} />
      </Card>
    </main>
  );
}
