"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  removeParentPinAction,
  setParentPinAction,
} from "@/lib/actions/parent-pin";
import { useActionState } from "react";

type ParentPinSettingsFormProps = {
  hasPin: boolean;
  /** When set (e.g. from /parent/unlock), redirect after first PIN is created. */
  returnTo?: string;
  /** Omit outer card when already inside a parent unlock shell. */
  embedded?: boolean;
  /** Hide title and intro when wrapped in a collapsible section. */
  hideHeader?: boolean;
};

export function ParentPinSettingsForm({
  hasPin,
  returnTo,
  embedded = false,
  hideHeader = false,
}: ParentPinSettingsFormProps) {
  const [setState, setAction, setPending] = useActionState(
    setParentPinAction,
    {} as ActionState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeParentPinAction,
    {} as ActionState,
  );

  const pinForm = (
    <>
      {hideHeader ? null : (
        <>
          <h2 className="text-lg font-semibold text-zinc-100">Parent PIN</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {hasPin
              ? "Required to leave Cub view and open the parent area on a shared device."
              : "Set a PIN so kids cannot open settings, review, or assign tasks from Cub view."}
          </p>
        </>
      )}

      <form action={setAction} className={hideHeader ? "space-y-4" : "mt-5 space-y-4"}>
        {returnTo ? (
          <input type="hidden" name="returnTo" value={returnTo} />
        ) : null}
          {hasPin ? (
            <div>
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                name="currentPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="off"
                required
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="newPin">{hasPin ? "New PIN" : "PIN"}</Label>
            <Input
              id="newPin"
              name="newPin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="new-password"
              required
              placeholder="4–6 digits"
            />
          </div>
          <div>
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              name="confirmPin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          {setState.error ? (
            <p className="text-sm text-red-400">{setState.error}</p>
          ) : null}
          {setState.success ? (
            <p className="text-sm text-emerald-400">{setState.success}</p>
          ) : null}
          <Button type="submit" fullWidth size="lg" disabled={setPending}>
            {setPending
              ? "Saving…"
              : hasPin
                ? "Update PIN"
                : "Set parent PIN"}
          </Button>
        </form>
    </>
  );

  return (
    <div className="space-y-4">
      {embedded ? pinForm : <Card>{pinForm}</Card>}

      {hasPin ? (
        <div className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 p-4">
          <h3 className="font-medium text-zinc-200">Remove PIN</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Turns off the parent-area lock. Not recommended on shared devices.
          </p>
          <form action={removeAction} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="removeCurrentPin">Current PIN</Label>
              <Input
                id="removeCurrentPin"
                name="currentPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="off"
                required
              />
            </div>
            {removeState.error ? (
              <p className="text-sm text-red-400">{removeState.error}</p>
            ) : null}
            {removeState.success ? (
              <p className="text-sm text-emerald-400">{removeState.success}</p>
            ) : null}
            <Button
              type="submit"
              variant="danger"
              fullWidth
              size="lg"
              disabled={removePending}
            >
              {removePending ? "Removing…" : "Remove PIN"}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
