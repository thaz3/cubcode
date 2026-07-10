"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import { requestParentPinResetAction } from "@/lib/actions/parent-pin-reset";

type ForgotParentPinFormProps = {
  maskedEmail: string;
  returnTo: string;
};

export function ForgotParentPinForm({
  maskedEmail,
  returnTo,
}: ForgotParentPinFormProps) {
  const [state, formAction, isPending] = useActionState(
    requestParentPinResetAction,
    {} as ActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-zinc-400">
        We&apos;ll email a reset link to{" "}
        <span className="font-medium text-zinc-200">{maskedEmail}</span>. The
        link expires in 1 hour.
      </p>

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
        {isPending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        <Link
          href={`/parent/unlock?returnTo=${encodeURIComponent(returnTo)}`}
          className="font-medium text-cub-gold"
        >
          ← Back to PIN entry
        </Link>
      </p>
    </form>
  );
}
