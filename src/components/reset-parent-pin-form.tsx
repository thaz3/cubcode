"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { resetParentPinAction } from "@/lib/actions/parent-pin-reset";

type ResetParentPinFormProps = {
  token: string;
};

export function ResetParentPinForm({ token }: ResetParentPinFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetParentPinAction,
    {} as ActionState,
  );

  if (!token) {
    return (
      <div className="space-y-4 text-sm text-zinc-400">
        <p>This reset link is missing a token.</p>
        <Link
          href="/parent/forgot-pin"
          className="font-medium text-cub-gold"
        >
          Request a new reset link →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="newPin">New parent PIN</Label>
        <Input
          id="newPin"
          name="newPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={6}
          required
          placeholder="4–6 digits"
          className="text-center text-2xl tracking-[0.3em]"
        />
      </div>

      <div>
        <Label htmlFor="confirmPin">Confirm new PIN</Label>
        <Input
          id="confirmPin"
          name="confirmPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={6}
          required
          placeholder="4–6 digits"
          className="text-center text-2xl tracking-[0.3em]"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={isPending}>
        {isPending ? "Saving…" : "Set new PIN"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        <Link href="/parent/forgot-pin" className="font-medium text-cub-gold">
          Request a new link
        </Link>
      </p>
    </form>
  );
}
