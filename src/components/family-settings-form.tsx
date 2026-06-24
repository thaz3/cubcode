"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFamilySettingsAction } from "@/lib/actions/family";
import type { ActionState } from "@/lib/actions/auth";
import { useActionState } from "react";

type FamilySettingsFormProps = {
  initialValues: {
    name: string;
    dailyPhoneCapMinutes: number;
    weekendBankCapMinutes: number;
    exchangeFocusMinutes: number;
    exchangePhoneMinutes: number;
  };
};

export function FamilySettingsForm({ initialValues }: FamilySettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateFamilySettingsAction,
    {} as ActionState,
  );

  return (
    <Card>
      <form action={formAction} className="space-y-5">
        <div>
          <Label htmlFor="name">Family name (optional)</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialValues.name}
            placeholder="The Johnson Family"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dailyPhoneCapMinutes">Daily phone cap (minutes)</Label>
            <Input
              id="dailyPhoneCapMinutes"
              name="dailyPhoneCapMinutes"
              type="number"
              min={0}
              defaultValue={initialValues.dailyPhoneCapMinutes}
              required
            />
          </div>
          <div>
            <Label htmlFor="weekendBankCapMinutes">
              Weekend bank cap (minutes)
            </Label>
            <Input
              id="weekendBankCapMinutes"
              name="weekendBankCapMinutes"
              type="number"
              min={0}
              defaultValue={initialValues.weekendBankCapMinutes}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="exchangeFocusMinutes">Focus minutes earned</Label>
            <Input
              id="exchangeFocusMinutes"
              name="exchangeFocusMinutes"
              type="number"
              min={1}
              defaultValue={initialValues.exchangeFocusMinutes}
              required
            />
          </div>
          <div>
            <Label htmlFor="exchangePhoneMinutes">Phone minutes rewarded</Label>
            <Input
              id="exchangePhoneMinutes"
              name="exchangePhoneMinutes"
              type="number"
              min={0}
              defaultValue={initialValues.exchangePhoneMinutes}
              required
            />
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Every{" "}
          <strong>{initialValues.exchangeFocusMinutes || "—"}</strong> minutes of
          focused effort earns{" "}
          <strong>{initialValues.exchangePhoneMinutes || "—"}</strong> minutes
          of recreational phone time. C.U.B. Code calculates earned digital
          freedom. Parents control access.
        </p>

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save household rules"}
        </Button>
      </form>
    </Card>
  );
}
