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

        <p className="text-sm text-zinc-400">
          Every{" "}
          <strong className="text-zinc-200">{initialValues.exchangeFocusMinutes || "—"}</strong> minutes of
          focused effort earns{" "}
          <strong className="text-zinc-200">{initialValues.exchangePhoneMinutes || "—"}</strong> minutes
          of recreational phone time.
        </p>

        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-400">{state.success}</p>
        ) : null}

        <div className="sticky bottom-20 z-10 -mx-1 rounded-xl bg-zinc-900/95 p-3 backdrop-blur lg:static lg:bg-transparent lg:p-0">
          <Button type="submit" fullWidth size="lg" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
