import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16 pb-nav-safe">
      <div className="mb-6 space-y-2 text-center">
        <Link href="/" className="text-sm font-bold text-amber-500">
          C.U.B. Code
        </Link>
        <h1 className="text-2xl font-bold text-zinc-50">Create parent account</h1>
        <p className="text-sm text-zinc-400">
          Sign up to create your family and add Cub profiles.
        </p>
      </div>
      <Card>
        <AuthForm mode="signup" />
      </Card>
    </main>
  );
}
