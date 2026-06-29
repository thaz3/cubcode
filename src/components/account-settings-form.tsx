"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccountSettingsAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/auth";
import { useActionState } from "react";

type AccountSettingsFormProps = {
  initialValues: {
    email: string;
    name: string;
  };
};

export function AccountSettingsForm({ initialValues }: AccountSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAccountSettingsAction,
    {} as ActionState,
  );

  return (
    <CollapsibleSection
      title="Parent account"
      summary={`${initialValues.email} · update name or password`}
      defaultOpen
    >
      <form action={formAction} className="space-y-5">
        <div>
          <Label htmlFor="account-email">Sign-in email</Label>
          <p
            id="account-email"
            className="min-h-11 rounded-xl border border-zinc-700 bg-cub-charcoal/60 px-4 py-2.5 text-base text-zinc-300"
          >
            {initialValues.email}
          </p>
          <p id="account-email-help" className="mt-1 text-xs text-zinc-500">
            Email changes are not supported in this MVP. Contact support if you
            need a different address.
          </p>
        </div>

        <div>
          <Label htmlFor="account-name">Your name</Label>
          <Input
            id="account-name"
            name="name"
            defaultValue={initialValues.name}
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-4 rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 p-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Change password</p>
            <p className="mt-1 text-xs text-zinc-500">
              Leave blank to keep your current password.
            </p>
          </div>

          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
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
              />
            </div>
          </div>
        </div>

        <FormSubmitFooter error={state.error} success={state.success}>
          <Button type="submit" variant="constructive" fullWidth size="lg" disabled={isPending}>
            {isPending ? "Saving..." : "Save account"}
          </Button>
        </FormSubmitFooter>
      </form>
    </CollapsibleSection>
  );
}
