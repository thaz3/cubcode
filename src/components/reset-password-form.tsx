"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { resetPasswordAction } from "@/lib/actions/password-reset";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    {} as ActionState,
  );

  if (!token) {
    return (
      <div className="space-y-4 text-sm text-zinc-400">
        <p>This reset link is missing a token.</p>
        <Link href="/forgot-password" className="font-medium text-cub-gold">
          Request a new reset link →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-400" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={isPending}>
        {isPending ? "Saving…" : "Set new password"}
      </Button>

      {state.success ? (
        <p className="text-center text-sm text-zinc-400">
          <Link href="/login" className="font-medium text-cub-gold">
            Go to log in →
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-zinc-400">
          <Link href="/forgot-password" className="font-medium text-cub-gold">
            Request a new link
          </Link>
        </p>
      )}
    </form>
  );
}
