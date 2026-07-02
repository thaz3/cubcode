import type { PrismaClient } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export class FamilyDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyDeletionError";
  }
}

export type FamilyDeletionCounts = {
  user: number;
  passwordResetToken: number;
  family: number;
  cub: number;
  taskTemplate: number;
  task: number;
  focusBlockLog: number;
  xpLedgerEntry: number;
  focusTokenLedgerEntry: number;
  phoneTimeLedgerEntry: number;
  weekendBankLedgerEntry: number;
  rewardStoreItem: number;
  rewardRedemption: number;
  rewardRedemptionRequest: number;
  guardianNudgePreferences: number;
  guardianNudgeRule: number;
  guardianNudge: number;
  challenge: number;
  challengeProgressLog: number;
  trainingDeck: number;
  focusActivityCard: number;
  focusDeckStackItem: number;
  focusActivityCompletion: number;
  councilDaySession: number;
  councilDayCubEntry: number;
  calendarEvent: number;
};

export type FamilyDeletionPreview = {
  email: string;
  userId: string;
  userName: string | null;
  userCreatedAt: Date;
  familyId: string | null;
  familyName: string | null;
  cubDisplayNames: string[];
  counts: FamilyDeletionCounts;
  totalRecords: number;
};

type DbClient = Pick<
  PrismaClient,
  | "user"
  | "passwordResetToken"
  | "family"
  | "cub"
  | "taskTemplate"
  | "task"
  | "focusBlockLog"
  | "xpLedgerEntry"
  | "focusTokenLedgerEntry"
  | "phoneTimeLedgerEntry"
  | "weekendBankLedgerEntry"
  | "rewardStoreItem"
  | "rewardRedemption"
  | "rewardRedemptionRequest"
  | "guardianNudgePreferences"
  | "guardianNudgeRule"
  | "guardianNudge"
  | "challenge"
  | "challengeProgressLog"
  | "trainingDeck"
  | "focusActivityCard"
  | "focusDeckStackItem"
  | "focusActivityCompletion"
  | "councilDaySession"
  | "councilDayCubEntry"
  | "calendarEvent"
>;

function normalizeParentEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sumCounts(counts: FamilyDeletionCounts): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

async function countFamilyRecords(
  client: DbClient,
  familyId: string,
  cubIds: string[],
): Promise<Omit<FamilyDeletionCounts, "user" | "passwordResetToken">> {
  const cubFilter = cubIds.length > 0 ? { cubId: { in: cubIds } } : { cubId: { in: [] as string[] } };

  const [
    family,
    cub,
    taskTemplate,
    task,
    focusBlockLog,
    xpLedgerEntry,
    focusTokenLedgerEntry,
    phoneTimeLedgerEntry,
    weekendBankLedgerEntry,
    rewardStoreItem,
    rewardRedemption,
    rewardRedemptionRequest,
    guardianNudgePreferences,
    guardianNudgeRule,
    guardianNudge,
    challenge,
    challengeProgressLog,
    trainingDeck,
    focusActivityCard,
    focusDeckStackItem,
    focusActivityCompletion,
    councilDaySession,
    councilDayCubEntry,
    calendarEvent,
  ] = await Promise.all([
    client.family.count({ where: { id: familyId } }),
    client.cub.count({ where: { familyId } }),
    client.taskTemplate.count({ where: { familyId } }),
    client.task.count({ where: { familyId } }),
    client.focusBlockLog.count({ where: cubFilter }),
    client.xpLedgerEntry.count({ where: cubFilter }),
    client.focusTokenLedgerEntry.count({ where: cubFilter }),
    client.phoneTimeLedgerEntry.count({ where: cubFilter }),
    client.weekendBankLedgerEntry.count({ where: cubFilter }),
    client.rewardStoreItem.count({ where: { familyId } }),
    client.rewardRedemption.count({ where: cubFilter }),
    client.rewardRedemptionRequest.count({ where: { familyId } }),
    client.guardianNudgePreferences.count({ where: { familyId } }),
    client.guardianNudgeRule.count({ where: { familyId } }),
    client.guardianNudge.count({ where: { familyId } }),
    client.challenge.count({ where: { familyId } }),
    client.challengeProgressLog.count({ where: { familyId } }),
    client.trainingDeck.count({ where: { familyId } }),
    client.focusActivityCard.count({ where: { familyId } }),
    client.focusDeckStackItem.count({ where: { familyId } }),
    client.focusActivityCompletion.count({ where: { familyId } }),
    client.councilDaySession.count({ where: { familyId } }),
    client.councilDayCubEntry.count({
      where: { session: { familyId } },
    }),
    client.calendarEvent.count({ where: { familyId } }),
  ]);

  return {
    family,
    cub,
    taskTemplate,
    task,
    focusBlockLog,
    xpLedgerEntry,
    focusTokenLedgerEntry,
    phoneTimeLedgerEntry,
    weekendBankLedgerEntry,
    rewardStoreItem,
    rewardRedemption,
    rewardRedemptionRequest,
    guardianNudgePreferences,
    guardianNudgeRule,
    guardianNudge,
    challenge,
    challengeProgressLog,
    trainingDeck,
    focusActivityCard,
    focusDeckStackItem,
    focusActivityCompletion,
    councilDaySession,
    councilDayCubEntry,
    calendarEvent,
  };
}

export async function previewFamilyDeletionByEmail(
  email: string,
  client: DbClient = db,
): Promise<FamilyDeletionPreview> {
  const normalizedEmail = normalizeParentEmail(email);
  if (!normalizedEmail) {
    throw new FamilyDeletionError("A parent email is required.");
  }

  const user = await client.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      family: {
        include: {
          cubs: {
            select: { id: true, displayName: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!user) {
    throw new FamilyDeletionError(`No user found for email: ${normalizedEmail}`);
  }

  const passwordResetToken = await client.passwordResetToken.count({
    where: { userId: user.id },
  });

  const familyCounts = user.family
    ? await countFamilyRecords(
        client,
        user.family.id,
        user.family.cubs.map((cub) => cub.id),
      )
    : {
        family: 0,
        cub: 0,
        taskTemplate: 0,
        task: 0,
        focusBlockLog: 0,
        xpLedgerEntry: 0,
        focusTokenLedgerEntry: 0,
        phoneTimeLedgerEntry: 0,
        weekendBankLedgerEntry: 0,
        rewardStoreItem: 0,
        rewardRedemption: 0,
        rewardRedemptionRequest: 0,
        guardianNudgePreferences: 0,
        guardianNudgeRule: 0,
        guardianNudge: 0,
        challenge: 0,
        challengeProgressLog: 0,
        trainingDeck: 0,
        focusActivityCard: 0,
        focusDeckStackItem: 0,
        focusActivityCompletion: 0,
        councilDaySession: 0,
        councilDayCubEntry: 0,
        calendarEvent: 0,
      };

  const counts: FamilyDeletionCounts = {
    user: 1,
    passwordResetToken,
    ...familyCounts,
  };

  return {
    email: user.email,
    userId: user.id,
    userName: user.name,
    userCreatedAt: user.createdAt,
    familyId: user.family?.id ?? null,
    familyName: user.family?.name ?? null,
    cubDisplayNames: user.family?.cubs.map((cub) => cub.displayName) ?? [],
    counts,
    totalRecords: sumCounts(counts),
  };
}

export function formatFamilyDeletionPreview(preview: FamilyDeletionPreview): string {
  const lines = [
    "Beta family deletion preview",
    "==============================",
    `Parent email: ${preview.email}`,
    `User id: ${preview.userId}`,
    `User name: ${preview.userName ?? "(none)"}`,
    `User created: ${preview.userCreatedAt.toISOString()}`,
    `Family id: ${preview.familyId ?? "(none)"}`,
    `Family name: ${preview.familyName ?? "(none)"}`,
    `Cub profiles: ${
      preview.cubDisplayNames.length > 0
        ? preview.cubDisplayNames.join(", ")
        : "(none)"
    }`,
    "",
    "Records that would be deleted:",
  ];

  for (const [model, count] of Object.entries(preview.counts)) {
    if (count > 0) {
      lines.push(`  ${model}: ${count}`);
    }
  }

  lines.push("", `Total records: ${preview.totalRecords}`);
  return lines.join("\n");
}

export type DeleteFamilyByEmailOptions = {
  email: string;
  confirmEmail: string;
  dryRun?: boolean;
};

export type DeleteFamilyByEmailResult = {
  dryRun: boolean;
  deleted: boolean;
  preview: FamilyDeletionPreview;
};

/**
 * Deletes one parent account and all family-scoped data for that owner email.
 * Other users are never touched. Requires confirmEmail to match email exactly.
 */
export async function deleteFamilyByParentEmail(
  options: DeleteFamilyByEmailOptions,
  client: DbClient & Pick<PrismaClient, "$transaction"> = db,
): Promise<DeleteFamilyByEmailResult> {
  const normalizedEmail = normalizeParentEmail(options.email);
  const normalizedConfirm = normalizeParentEmail(options.confirmEmail);

  if (!normalizedEmail) {
    throw new FamilyDeletionError("A parent email is required.");
  }

  if (normalizedEmail !== normalizedConfirm) {
    throw new FamilyDeletionError(
      "Confirmation email does not match. Deletion was not performed.",
    );
  }

  const preview = await previewFamilyDeletionByEmail(normalizedEmail, client);

  if (options.dryRun !== false) {
    return { dryRun: true, deleted: false, preview };
  }

  await client.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, family: { select: { id: true } } },
    });

    if (!user) {
      throw new FamilyDeletionError(`No user found for email: ${normalizedEmail}`);
    }

    if (user.family) {
      await tx.family.delete({ where: { id: user.family.id } });
    }

    await tx.user.delete({ where: { id: user.id } });
  });

  return { dryRun: false, deleted: true, preview };
}
