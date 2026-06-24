-- CreateEnum
CREATE TYPE "LedgerReason" AS ENUM ('TASK_APPROVAL', 'REWARD_REDEMPTION', 'PARENT_ADJUSTMENT', 'DAILY_CAP_OVERFLOW', 'WEEKEND_BANK_USE');

-- CreateTable
CREATE TABLE "XpLedgerEntry" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "sourceTaskId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "XpLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusTokenLedgerEntry" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "sourceTaskId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "FocusTokenLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneTimeLedgerEntry" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "sourceTaskId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "PhoneTimeLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekendBankLedgerEntry" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "sourceTaskId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "WeekendBankLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardStoreItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "costFocusTokens" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "RewardStoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "focusTokensSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "rewardStoreItemId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XpLedgerEntry_cubId_idx" ON "XpLedgerEntry"("cubId");
CREATE INDEX "XpLedgerEntry_sourceTaskId_idx" ON "XpLedgerEntry"("sourceTaskId");
CREATE INDEX "XpLedgerEntry_createdAt_idx" ON "XpLedgerEntry"("createdAt");

CREATE INDEX "FocusTokenLedgerEntry_cubId_idx" ON "FocusTokenLedgerEntry"("cubId");
CREATE INDEX "FocusTokenLedgerEntry_sourceTaskId_idx" ON "FocusTokenLedgerEntry"("sourceTaskId");
CREATE INDEX "FocusTokenLedgerEntry_createdAt_idx" ON "FocusTokenLedgerEntry"("createdAt");

CREATE INDEX "PhoneTimeLedgerEntry_cubId_idx" ON "PhoneTimeLedgerEntry"("cubId");
CREATE INDEX "PhoneTimeLedgerEntry_sourceTaskId_idx" ON "PhoneTimeLedgerEntry"("sourceTaskId");
CREATE INDEX "PhoneTimeLedgerEntry_createdAt_idx" ON "PhoneTimeLedgerEntry"("createdAt");

CREATE INDEX "WeekendBankLedgerEntry_cubId_idx" ON "WeekendBankLedgerEntry"("cubId");
CREATE INDEX "WeekendBankLedgerEntry_sourceTaskId_idx" ON "WeekendBankLedgerEntry"("sourceTaskId");
CREATE INDEX "WeekendBankLedgerEntry_createdAt_idx" ON "WeekendBankLedgerEntry"("createdAt");

CREATE INDEX "RewardStoreItem_familyId_idx" ON "RewardStoreItem"("familyId");

CREATE INDEX "RewardRedemption_cubId_idx" ON "RewardRedemption"("cubId");
CREATE INDEX "RewardRedemption_rewardStoreItemId_idx" ON "RewardRedemption"("rewardStoreItemId");

-- AddForeignKey
ALTER TABLE "XpLedgerEntry" ADD CONSTRAINT "XpLedgerEntry_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "XpLedgerEntry" ADD CONSTRAINT "XpLedgerEntry_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FocusTokenLedgerEntry" ADD CONSTRAINT "FocusTokenLedgerEntry_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FocusTokenLedgerEntry" ADD CONSTRAINT "FocusTokenLedgerEntry_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PhoneTimeLedgerEntry" ADD CONSTRAINT "PhoneTimeLedgerEntry_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhoneTimeLedgerEntry" ADD CONSTRAINT "PhoneTimeLedgerEntry_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WeekendBankLedgerEntry" ADD CONSTRAINT "WeekendBankLedgerEntry_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeekendBankLedgerEntry" ADD CONSTRAINT "WeekendBankLedgerEntry_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RewardStoreItem" ADD CONSTRAINT "RewardStoreItem_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardStoreItemId_fkey" FOREIGN KEY ("rewardStoreItemId") REFERENCES "RewardStoreItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
