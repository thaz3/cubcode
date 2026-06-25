-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('BINARY_ROUTINE');

-- CreateEnum
CREATE TYPE "ChallengeIntervalType" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChallengeProgressStatus" AS ENUM ('PENDING', 'SUBMITTED', 'SENT_BACK', 'REJECTED', 'REWARDED');

-- AlterEnum
ALTER TYPE "LedgerReason" ADD VALUE 'CHALLENGE_APPROVAL';

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "challengeType" "ChallengeType" NOT NULL DEFAULT 'BINARY_ROUTINE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "intervalType" "ChallengeIntervalType" NOT NULL,
    "intervalConfig" JSONB,
    "proofType" "TaskProofType" NOT NULL,
    "proofPrompt" TEXT,
    "proofChecklistItems" JSONB,
    "xpEarned" INTEGER NOT NULL DEFAULT 10,
    "focusTokensEarned" INTEGER NOT NULL DEFAULT 1,
    "phoneMinutesEarned" INTEGER NOT NULL DEFAULT 15,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeProgressLog" (
    "id" TEXT NOT NULL,
    "intervalStart" TIMESTAMP(3) NOT NULL,
    "intervalEnd" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN,
    "reflection" TEXT,
    "checklistData" JSONB,
    "reviewNote" TEXT,
    "status" "ChallengeProgressStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "challengeId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,

    CONSTRAINT "ChallengeProgressLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "XpLedgerEntry" ADD COLUMN "sourceChallengeProgressLogId" TEXT;

-- AlterTable
ALTER TABLE "FocusTokenLedgerEntry" ADD COLUMN "sourceChallengeProgressLogId" TEXT;

-- AlterTable
ALTER TABLE "PhoneTimeLedgerEntry" ADD COLUMN "sourceChallengeProgressLogId" TEXT;

-- CreateIndex
CREATE INDEX "Challenge_familyId_idx" ON "Challenge"("familyId");

-- CreateIndex
CREATE INDEX "Challenge_cubId_idx" ON "Challenge"("cubId");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeProgressLog_challengeId_intervalStart_key" ON "ChallengeProgressLog"("challengeId", "intervalStart");

-- CreateIndex
CREATE INDEX "ChallengeProgressLog_familyId_idx" ON "ChallengeProgressLog"("familyId");

-- CreateIndex
CREATE INDEX "ChallengeProgressLog_cubId_idx" ON "ChallengeProgressLog"("cubId");

-- CreateIndex
CREATE INDEX "ChallengeProgressLog_status_idx" ON "ChallengeProgressLog"("status");

-- CreateIndex
CREATE INDEX "ChallengeProgressLog_challengeId_idx" ON "ChallengeProgressLog"("challengeId");

-- CreateIndex
CREATE INDEX "XpLedgerEntry_sourceChallengeProgressLogId_idx" ON "XpLedgerEntry"("sourceChallengeProgressLogId");

-- CreateIndex
CREATE INDEX "FocusTokenLedgerEntry_sourceChallengeProgressLogId_idx" ON "FocusTokenLedgerEntry"("sourceChallengeProgressLogId");

-- CreateIndex
CREATE INDEX "PhoneTimeLedgerEntry_sourceChallengeProgressLogId_idx" ON "PhoneTimeLedgerEntry"("sourceChallengeProgressLogId");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgressLog" ADD CONSTRAINT "ChallengeProgressLog_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgressLog" ADD CONSTRAINT "ChallengeProgressLog_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgressLog" ADD CONSTRAINT "ChallengeProgressLog_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgressLog" ADD CONSTRAINT "ChallengeProgressLog_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpLedgerEntry" ADD CONSTRAINT "XpLedgerEntry_sourceChallengeProgressLogId_fkey" FOREIGN KEY ("sourceChallengeProgressLogId") REFERENCES "ChallengeProgressLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTokenLedgerEntry" ADD CONSTRAINT "FocusTokenLedgerEntry_sourceChallengeProgressLogId_fkey" FOREIGN KEY ("sourceChallengeProgressLogId") REFERENCES "ChallengeProgressLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneTimeLedgerEntry" ADD CONSTRAINT "PhoneTimeLedgerEntry_sourceChallengeProgressLogId_fkey" FOREIGN KEY ("sourceChallengeProgressLogId") REFERENCES "ChallengeProgressLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
