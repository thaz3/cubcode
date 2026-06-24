import type { Cub, LedgerReason, Prisma, RewardGrantType, Task } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import {
  focusBlockRewardMultiplier,
  parseRequiredGrowthCategories,
} from "@/lib/focus-growth";
import { getRankProgress, type RankProgress } from "@/lib/ranks";
import { getEffectiveTaskRewards } from "@/lib/task-rewards";

type LedgerClient = Prisma.TransactionClient | typeof db;

export type CubRewardSummary = {
  totalXp: number;
  totalFocusTokens: number;
  phoneMinutesToday: number;
  phoneMinutesFromTasksToday: number;
  phoneMinutesFromRedemptionsToday: number;
  phoneMinutesAvailableToday: number;
  dailyPhoneCapMinutes: number;
  weekendBankMinutes: number;
  weekendBankCapMinutes: number;
  rank: RankProgress;
};

function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfLocalDay(date = new Date()): Date {
  const start = startOfLocalDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

function todayRange(now = new Date()) {
  return { gte: startOfLocalDay(now), lt: endOfLocalDay(now) };
}

export async function sumLedgerAmounts(cubId: string) {
  const [xp, focusTokens, phoneAll, weekendBank] = await Promise.all([
    db.xpLedgerEntry.aggregate({
      where: { cubId },
      _sum: { amount: true },
    }),
    db.focusTokenLedgerEntry.aggregate({
      where: { cubId },
      _sum: { amount: true },
    }),
    db.phoneTimeLedgerEntry.aggregate({
      where: { cubId },
      _sum: { amount: true },
    }),
    db.weekendBankLedgerEntry.aggregate({
      where: { cubId },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalXp: xp._sum.amount ?? 0,
    totalFocusTokens: focusTokens._sum.amount ?? 0,
    totalPhoneMinutes: phoneAll._sum.amount ?? 0,
    weekendBankMinutes: weekendBank._sum.amount ?? 0,
  };
}

async function sumPhoneCreditsTodayForClient(
  cubId: string,
  client: LedgerClient,
  now = new Date(),
) {
  const result = await client.phoneTimeLedgerEntry.aggregate({
    where: {
      cubId,
      amount: { gt: 0 },
      createdAt: todayRange(now),
    },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
}

export async function sumPhoneCreditsToday(cubId: string, now = new Date()) {
  return sumPhoneCreditsTodayForClient(cubId, db, now);
}

async function sumPhoneCreditsTodayByReason(
  cubId: string,
  reason: LedgerReason,
  now = new Date(),
) {
  const result = await db.phoneTimeLedgerEntry.aggregate({
    where: {
      cubId,
      reason,
      amount: { gt: 0 },
      createdAt: todayRange(now),
    },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
}

export async function getCubRewardSummary(cub: Cub): Promise<CubRewardSummary> {
  const [balances, phoneMinutesToday, phoneFromTasks, phoneFromRedemptions] =
    await Promise.all([
      sumLedgerAmounts(cub.id),
      sumPhoneCreditsToday(cub.id),
      sumPhoneCreditsTodayByReason(cub.id, "TASK_APPROVAL"),
      sumPhoneCreditsTodayByReason(cub.id, "REWARD_REDEMPTION"),
    ]);

  const phoneMinutesAvailableToday = Math.max(
    0,
    Math.min(phoneMinutesToday, cub.dailyPhoneCapMinutes),
  );

  const weekendBankMinutes = Math.min(
    balances.weekendBankMinutes,
    cub.weekendBankCapMinutes,
  );

  return {
    totalXp: balances.totalXp,
    totalFocusTokens: balances.totalFocusTokens,
    phoneMinutesToday,
    phoneMinutesFromTasksToday: phoneFromTasks,
    phoneMinutesFromRedemptionsToday: phoneFromRedemptions,
    phoneMinutesAvailableToday,
    dailyPhoneCapMinutes: cub.dailyPhoneCapMinutes,
    weekendBankMinutes,
    weekendBankCapMinutes: cub.weekendBankCapMinutes,
    rank: getRankProgress(balances.totalXp),
  };
}

export async function creditPhoneMinutesForCub(
  cub: Cub,
  minutes: number,
  options: {
    reason: LedgerReason;
    note: string;
    createdByUserId: string;
    sourceTaskId?: string | null;
    client?: LedgerClient;
  },
): Promise<{ phoneMinutes: number; weekendBankMinutes: number }> {
  if (minutes <= 0) {
    return { phoneMinutes: 0, weekendBankMinutes: 0 };
  }

  const client = options.client ?? db;
  const phoneEarnedToday = await sumPhoneCreditsTodayForClient(cub.id, client);
  const roomToday = Math.max(0, cub.dailyPhoneCapMinutes - phoneEarnedToday);
  const phoneToday = Math.min(minutes, roomToday);
  const weekendOverflow = minutes - phoneToday;

  const baseEntry = {
    cubId: cub.id,
    sourceTaskId: options.sourceTaskId ?? null,
    createdByUserId: options.createdByUserId,
    reason: options.reason,
    note: options.note,
  };

  if (phoneToday > 0) {
    await client.phoneTimeLedgerEntry.create({
      data: { ...baseEntry, amount: phoneToday },
    });
  }

  let weekendBankMinutes = 0;
  if (weekendOverflow > 0) {
    const cappedBank = await client.weekendBankLedgerEntry.aggregate({
      where: { cubId: cub.id },
      _sum: { amount: true },
    });
    const currentBank = cappedBank._sum.amount ?? 0;
    const roomInBank = Math.max(0, cub.weekendBankCapMinutes - currentBank);
    weekendBankMinutes = Math.min(weekendOverflow, roomInBank);

    if (weekendBankMinutes > 0) {
      await client.weekendBankLedgerEntry.create({
        data: {
          ...baseEntry,
          amount: weekendBankMinutes,
          reason: "DAILY_CAP_OVERFLOW",
          note: `${options.note} — ${weekendBankMinutes} min to Weekend Bank (daily cap)`,
        },
      });
    }
  }

  return { phoneMinutes: phoneToday, weekendBankMinutes };
}

export async function creditWeekendBankMinutesForCub(
  cub: Cub,
  minutes: number,
  options: {
    note: string;
    createdByUserId: string;
    client?: LedgerClient;
  },
): Promise<number> {
  if (minutes <= 0) {
    return 0;
  }

  const client = options.client ?? db;
  const cappedBank = await client.weekendBankLedgerEntry.aggregate({
    where: { cubId: cub.id },
    _sum: { amount: true },
  });
  const currentBank = cappedBank._sum.amount ?? 0;
  const roomInBank = Math.max(0, cub.weekendBankCapMinutes - currentBank);
  const granted = Math.min(minutes, roomInBank);

  if (granted > 0) {
    await client.weekendBankLedgerEntry.create({
      data: {
        cubId: cub.id,
        amount: granted,
        reason: "REWARD_REDEMPTION",
        note: options.note,
        createdByUserId: options.createdByUserId,
      },
    });
  }

  return granted;
}

export async function applyStoreRewardGrant(
  cub: Cub,
  item: {
    title: string;
    grantType: RewardGrantType;
    minutesGranted: number | null;
  },
  createdByUserId: string,
  client: LedgerClient,
): Promise<{ phoneMinutes: number; weekendBankMinutes: number }> {
  const minutes = item.minutesGranted ?? 0;
  if (minutes <= 0 || item.grantType === "NONE") {
    return { phoneMinutes: 0, weekendBankMinutes: 0 };
  }

  const note = `Redeemed: ${item.title}`;

  if (item.grantType === "PHONE_TIME") {
    return creditPhoneMinutesForCub(cub, minutes, {
      reason: "REWARD_REDEMPTION",
      note,
      createdByUserId,
      client,
    });
  }

  if (item.grantType === "WEEKEND_BANK") {
    const weekendBankMinutes = await creditWeekendBankMinutesForCub(cub, minutes, {
      note,
      createdByUserId,
      client,
    });
    return { phoneMinutes: 0, weekendBankMinutes };
  }

  return { phoneMinutes: 0, weekendBankMinutes: 0 };
}

export async function taskRewardsAlreadyCredited(
  taskId: string,
  client: LedgerClient = db,
) {
  const existing = await client.xpLedgerEntry.findFirst({
    where: { sourceTaskId: taskId },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function creditApprovedTaskRewards(
  task: Task & { cub: Cub | null },
  createdByUserId: string,
  client: LedgerClient = db,
) {
  if (!task.cubId || !task.cub) {
    throw new Error("Approved tasks must be assigned to a Cub.");
  }

  if (await taskRewardsAlreadyCredited(task.id, client)) {
    return { alreadyCredited: true as const, penalizedForLateSubmission: false };
  }

  const cub = task.cub;
  const baseRewards = getEffectiveTaskRewards(task);
  const focusMultiplier =
    task.category === "FOCUS_BLOCK"
      ? focusBlockRewardMultiplier(
          parseRequiredGrowthCategories(cub).length,
        )
      : 1;
  const rewards = {
    ...baseRewards,
    xpEarned: Math.floor(baseRewards.xpEarned * focusMultiplier),
    focusTokensEarned: Math.floor(
      baseRewards.focusTokensEarned * focusMultiplier,
    ),
    phoneMinutesEarned: Math.floor(
      baseRewards.phoneMinutesEarned * focusMultiplier,
    ),
    focusMinutesEarned: Math.floor(
      baseRewards.focusMinutesEarned * focusMultiplier,
    ),
  };
  const focusShareNote =
    task.category === "FOCUS_BLOCK"
      ? ` · 1/${parseRequiredGrowthCategories(cub).length} weekly growth share`
      : "";
  const noteSuffix = `${rewards.penalizedForLateSubmission ? " (50% — submitted after due date)" : ""}${focusShareNote}`;

  const baseEntry = {
    cubId: cub.id,
    sourceTaskId: task.id,
    createdByUserId,
    reason: "TASK_APPROVAL" as const,
  };

  if (rewards.xpEarned !== 0) {
    await client.xpLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: rewards.xpEarned,
        note: `Approved: ${task.title}${noteSuffix}`,
      },
    });
  }

  if (rewards.focusTokensEarned !== 0) {
    await client.focusTokenLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: rewards.focusTokensEarned,
        note: `Approved: ${task.title}${noteSuffix}`,
      },
    });
  }

  if (rewards.phoneMinutesEarned > 0) {
    await creditPhoneMinutesForCub(cub, rewards.phoneMinutesEarned, {
      reason: "TASK_APPROVAL",
      note: `Approved: ${task.title}${noteSuffix}`,
      createdByUserId,
      sourceTaskId: task.id,
      client,
    });
  }

  return {
    alreadyCredited: false as const,
    penalizedForLateSubmission: rewards.penalizedForLateSubmission,
  };
}

export async function creditCouncilDayBonus(
  entry: {
    id: string;
    cubId: string;
    bonusXpGranted: number;
    bonusTokensGranted: number;
    bonusGrantedAt: Date | null;
  },
  cub: Cub,
  weekLabel: string,
  createdByUserId: string,
  client: LedgerClient = db,
) {
  if (entry.bonusGrantedAt) {
    return { alreadyCredited: true as const };
  }

  const existing = await client.xpLedgerEntry.findFirst({
    where: { councilDayCubEntryId: entry.id },
    select: { id: true },
  });

  if (existing) {
    return { alreadyCredited: true as const };
  }

  const baseEntry = {
    cubId: cub.id,
    councilDayCubEntryId: entry.id,
    createdByUserId,
    reason: "COUNCIL_DAY" as const,
    note: `${FAMILY_DAY_LABEL} · ${weekLabel}`,
  };

  if (entry.bonusXpGranted > 0) {
    await client.xpLedgerEntry.create({
      data: { ...baseEntry, amount: entry.bonusXpGranted },
    });
  }

  if (entry.bonusTokensGranted > 0) {
    await client.focusTokenLedgerEntry.create({
      data: { ...baseEntry, amount: entry.bonusTokensGranted },
    });
  }

  await client.councilDayCubEntry.update({
    where: { id: entry.id },
    data: { bonusGrantedAt: new Date() },
  });

  return { alreadyCredited: false as const };
}

export const DEFAULT_REWARD_STORE_ITEMS = [
  {
    title: "Extra 15 min phone time",
    description: "Redeem for a one-time bonus on a day you choose.",
    costFocusTokens: 1,
    grantType: "PHONE_TIME" as const,
    minutesGranted: 15,
  },
  {
    title: "Pick dinner",
    description: "Choose what the family eats for one meal.",
    costFocusTokens: 2,
    grantType: "NONE" as const,
    minutesGranted: null,
  },
  {
    title: "Stay up 30 min later",
    description: "Weekend only — parent sets the night.",
    costFocusTokens: 3,
    grantType: "NONE" as const,
    minutesGranted: null,
  },
] as const;

export async function ensureDefaultRewardStoreItems(familyId: string) {
  const count = await db.rewardStoreItem.count({ where: { familyId } });
  if (count > 0) {
    await db.rewardStoreItem.updateMany({
      where: {
        familyId,
        title: "Extra 15 min phone time",
        grantType: "NONE",
      },
      data: {
        grantType: "PHONE_TIME",
        minutesGranted: 15,
      },
    });
    return;
  }

  await db.rewardStoreItem.createMany({
    data: DEFAULT_REWARD_STORE_ITEMS.map((item) => ({
      familyId,
      title: item.title,
      description: item.description,
      costFocusTokens: item.costFocusTokens,
      grantType: item.grantType,
      minutesGranted: item.minutesGranted,
    })),
  });
}
