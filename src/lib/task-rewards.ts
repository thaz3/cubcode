import { minutesUntilDue } from "@/lib/task-schedule";

export type TaskRewardAmounts = {
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  focusMinutesEarned: number;
};

export type TaskRewardContext = TaskRewardAmounts & {
  dueAt?: Date | null;
  dueAtHasTime?: boolean;
  submittedAt?: Date | null;
};

export type EffectiveTaskRewards = TaskRewardAmounts & {
  penalizedForLateSubmission: boolean;
};

export function isPastDueAt(
  task: { dueAt?: Date | null; dueAtHasTime?: boolean },
  at: Date,
): boolean {
  if (!task.dueAt) {
    return false;
  }

  return minutesUntilDue(task.dueAt, task.dueAtHasTime ?? false, at) < 0;
}

/** True when the Cub submitted after the due date/time. */
export function wasTaskSubmittedLate(task: TaskRewardContext): boolean {
  if (!task.dueAt || !task.submittedAt) {
    return false;
  }

  return isPastDueAt(task, task.submittedAt);
}

function halveReward(amount: number): number {
  return Math.floor(amount / 2);
}

export function getEffectiveTaskRewards(
  task: TaskRewardContext,
  referenceTime = new Date(),
): EffectiveTaskRewards {
  const penalizedForLateSubmission = isPastDueAt(
    task,
    task.submittedAt ?? referenceTime,
  );

  if (!penalizedForLateSubmission) {
    return {
      xpEarned: task.xpEarned,
      focusTokensEarned: task.focusTokensEarned,
      phoneMinutesEarned: task.phoneMinutesEarned,
      focusMinutesEarned: task.focusMinutesEarned,
      penalizedForLateSubmission: false,
    };
  }

  return {
    xpEarned: halveReward(task.xpEarned),
    focusTokensEarned: halveReward(task.focusTokensEarned),
    phoneMinutesEarned: halveReward(task.phoneMinutesEarned),
    focusMinutesEarned: halveReward(task.focusMinutesEarned),
    penalizedForLateSubmission: true,
  };
}

export const OVERDUE_REWARD_PENALTY_LABEL = "50% rewards — missed due date";
