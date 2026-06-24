import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 space-y-2 text-center">
        <Link href="/" className="text-sm font-medium text-amber-700">
          C.U.B. Code
        </Link>
        <h1 className="text-2xl font-bold">Parent log in</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Parents sign in to manage the household. Cubs do not have separate
          logins in Milestone 1.
        </p>
      </div>
      <Card>
        <AuthForm mode="login" />
      </Card>
    </main>
  );
}
