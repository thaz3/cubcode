"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { verifyParentPinAction } from "@/lib/actions/parent-pin";
import { useActionState } from "react";

type ParentPinUnlockFormProps = {
  returnTo: string;
};

export function ParentPinUnlockForm({ returnTo }: ParentPinUnlockFormProps) {
  const [state, formAction, isPending] = useActionState(
    verifyParentPinAction,
    {} as ActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div>
        <Label htmlFor="pin">Parent PIN</Label>
        <Input
          id="pin"
          name="pin"
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
        {isPending ? "Checking…" : "Unlock parent area"}
      </Button>
    </form>
  );
}
