import { AuthForm } from "@/components/auth-form";
import { ComplianceFooter } from "@/components/compliance-footer";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16 pb-nav-safe">
      <div className="mb-6 space-y-2 text-center">
        <Link href="/" className="text-sm font-bold text-cub-gold">
          C.U.B. Code
        </Link>
        <h1 className="text-2xl font-bold text-zinc-50">Create parent account</h1>
        <p className="text-sm text-zinc-400">
          Sign up to create your family and add Cub profiles.
        </p>
        <p className="text-xs text-zinc-500">
          Private beta — use demo child info only.{" "}
          <Link href="/beta" className="font-medium text-cub-gold hover:text-cub-gold-light">
            Read the beta notice
          </Link>
        </p>
      </div>
      <Card>
        <AuthForm mode="signup" />
      </Card>
      <div className="mt-8">
        <ComplianceFooter />
      </div>
    </main>
  );
}
