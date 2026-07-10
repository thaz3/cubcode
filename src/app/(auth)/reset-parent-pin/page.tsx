import { ResetParentPinForm } from "@/components/reset-parent-pin-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type ResetParentPinPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetParentPinPage({
  searchParams,
}: ResetParentPinPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16 pb-nav-safe">
      <div className="mb-6 space-y-2 text-center">
        <Link href="/" className="text-sm font-bold text-cub-gold">
          C.U.B. Code
        </Link>
        <h1 className="text-2xl font-bold text-zinc-50">Choose a new parent PIN</h1>
        <p className="text-sm text-zinc-400">
          Pick a new 4–6 digit PIN for the parent area.
        </p>
      </div>
      <Card>
        <ResetParentPinForm token={token} />
      </Card>
    </main>
  );
}
