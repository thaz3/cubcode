"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import type { RewardGrantType } from "@/generated/prisma/client";
import { MOBILE_TEXTAREA_CLASS } from "@/lib/mobile-form-styles";

export type RewardStoreItemFormValues = {
  title: string;
  description: string;
  costFocusTokens: number;
  grantType: RewardGrantType;
  minutesGranted: number | null;
};

type RewardStoreItemFormFieldsProps = {
  initialValues?: Partial<RewardStoreItemFormValues>;
  grantType: RewardGrantType;
  onGrantTypeChange: (value: RewardGrantType) => void;
};

const GRANT_TYPE_OPTIONS: Array<{
  value: RewardGrantType;
  label: string;
}> = [
  { value: "NONE", label: "Parent delivers (no minutes credited)" },
  { value: "PHONE_TIME", label: "Phone time today" },
  { value: "WEEKEND_BANK", label: "Weekend Bank minutes" },
  { value: "FOCUS_AREA_SWAP", label: "Focus area swap" },
];

export function RewardStoreItemFormFields({
  initialValues,
  grantType,
  onGrantTypeChange,
}: RewardStoreItemFormFieldsProps) {
  const showMinutes =
    grantType === "PHONE_TIME" || grantType === "WEEKEND_BANK";

  return (
    <>
      <div>
        <Label htmlFor="reward-title">Reward title</Label>
        <Input
          id="reward-title"
          name="title"
          required
          defaultValue={initialValues?.title ?? ""}
          placeholder="Extra screen time"
        />
      </div>
      <div>
        <Label htmlFor="reward-description">Description (optional)</Label>
        <textarea
          id="reward-description"
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
          className={MOBILE_TEXTAREA_CLASS}
          placeholder="What the Cub gets when they redeem this"
        />
      </div>
      <div>
        <Label htmlFor="reward-cost">Cost (Focus Tokens)</Label>
        <Input
          id="reward-cost"
          name="costFocusTokens"
          type="number"
          min={1}
          max={50}
          defaultValue={initialValues?.costFocusTokens ?? 1}
          required
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">What gets applied on redeem</p>
        <input type="hidden" name="grantType" value={grantType} />
        <RadioChoiceList
          name="grantTypeChoice"
          value={grantType}
          onChange={onGrantTypeChange}
          options={GRANT_TYPE_OPTIONS}
        />
      </div>
      {showMinutes ? (
        <div>
          <Label htmlFor="reward-minutes">Minutes to credit</Label>
          <Input
            id="reward-minutes"
            name="minutesGranted"
            type="number"
            min={1}
            max={240}
            defaultValue={initialValues?.minutesGranted ?? 15}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            {grantType === "PHONE_TIME"
              ? "Shows under Redeemed from store and Phone time today. Respects daily cap; overflow goes to Weekend Bank."
              : "Credits the Weekend Bank balance (respects bank cap)."}
          </p>
        </div>
      ) : null}
    </>
  );
}
