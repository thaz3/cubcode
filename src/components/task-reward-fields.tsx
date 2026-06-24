import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskRewardFieldsProps = {
  initialValues?: {
    focusMinutesEarned: number;
    phoneMinutesEarned: number;
    xpEarned: number;
    focusTokensEarned: number;
  };
};

export function TaskRewardFields({ initialValues }: TaskRewardFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div>
        <h4 className="text-sm font-medium">Rewards on approval</h4>
        <p className="mt-1 text-sm text-zinc-500">
          Set what this Cub earns when you approve the task. Adjust to match
          your household scale.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="focusMinutesEarned">Focus minutes</Label>
          <Input
            id="focusMinutesEarned"
            name="focusMinutesEarned"
            type="number"
            min={0}
            max={240}
            required
            defaultValue={initialValues?.focusMinutesEarned ?? 30}
          />
        </div>
        <div>
          <Label htmlFor="phoneMinutesEarned">Phone time (minutes)</Label>
          <Input
            id="phoneMinutesEarned"
            name="phoneMinutesEarned"
            type="number"
            min={0}
            max={480}
            required
            defaultValue={initialValues?.phoneMinutesEarned ?? 15}
          />
        </div>
        <div>
          <Label htmlFor="xpEarned">XP</Label>
          <Input
            id="xpEarned"
            name="xpEarned"
            type="number"
            min={0}
            max={10000}
            required
            defaultValue={initialValues?.xpEarned ?? 10}
          />
        </div>
        <div>
          <Label htmlFor="focusTokensEarned">Focus Tokens</Label>
          <Input
            id="focusTokensEarned"
            name="focusTokensEarned"
            type="number"
            min={0}
            max={100}
            required
            defaultValue={initialValues?.focusTokensEarned ?? 1}
          />
        </div>
      </div>
    </div>
  );
}
