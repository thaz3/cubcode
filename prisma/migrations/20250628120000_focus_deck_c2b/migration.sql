-- CreateEnum
CREATE TYPE "FocusDeckCategory" AS ENUM ('CHARACTER', 'WELLNESS', 'CREATIVITY', 'RESPONSIBILITY', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "FocusActivityCardStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FocusActivityCompletionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'SENT_BACK', 'REJECTED', 'REWARDED');

-- CreateEnum
CREATE TYPE "FocusDeckLocationType" AS ENUM ('HOME', 'OUTDOOR', 'COMMUNITY', 'ANY');

-- CreateEnum
CREATE TYPE "FocusDeckDifficulty" AS ENUM ('EASY', 'MEDIUM', 'CHALLENGING');

-- AlterEnum
ALTER TYPE "LedgerReason" ADD VALUE 'FOCUS_DECK_APPROVAL';

-- CreateTable
CREATE TABLE "FocusActivityCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "estimatedMinutes" INTEGER,
    "locationType" "FocusDeckLocationType",
    "difficulty" "FocusDeckDifficulty",
    "categoryPoints" JSONB NOT NULL,
    "proofType" "TaskProofType" NOT NULL,
    "proofPrompt" TEXT,
    "proofChecklistItems" JSONB,
    "focusMinutesEarned" INTEGER NOT NULL DEFAULT 30,
    "phoneMinutesEarned" INTEGER NOT NULL DEFAULT 15,
    "xpEarned" INTEGER NOT NULL DEFAULT 10,
    "focusTokensEarned" INTEGER NOT NULL DEFAULT 1,
    "status" "FocusActivityCardStatus" NOT NULL DEFAULT 'DRAFT',
    "starterKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "FocusActivityCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusDeckStackItem" (
    "id" TEXT NOT NULL,
    "weekStartsOn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "FocusDeckStackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusActivityCompletion" (
    "id" TEXT NOT NULL,
    "weekStartsOn" TIMESTAMP(3) NOT NULL,
    "status" "FocusActivityCompletionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "reflection" TEXT,
    "proofLink" TEXT,
    "checklistData" JSONB,
    "reviewNote" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,

    CONSTRAINT "FocusActivityCompletion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "XpLedgerEntry" ADD COLUMN "sourceFocusActivityCompletionId" TEXT;

-- AlterTable
ALTER TABLE "FocusTokenLedgerEntry" ADD COLUMN "sourceFocusActivityCompletionId" TEXT;

-- AlterTable
ALTER TABLE "PhoneTimeLedgerEntry" ADD COLUMN "sourceFocusActivityCompletionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FocusActivityCard_familyId_starterKey_key" ON "FocusActivityCard"("familyId", "starterKey");

-- CreateIndex
CREATE INDEX "FocusActivityCard_familyId_idx" ON "FocusActivityCard"("familyId");

-- CreateIndex
CREATE INDEX "FocusActivityCard_status_idx" ON "FocusActivityCard"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FocusDeckStackItem_cubId_cardId_weekStartsOn_key" ON "FocusDeckStackItem"("cubId", "cardId", "weekStartsOn");

-- CreateIndex
CREATE INDEX "FocusDeckStackItem_familyId_idx" ON "FocusDeckStackItem"("familyId");

-- CreateIndex
CREATE INDEX "FocusDeckStackItem_cubId_idx" ON "FocusDeckStackItem"("cubId");

-- CreateIndex
CREATE INDEX "FocusDeckStackItem_weekStartsOn_idx" ON "FocusDeckStackItem"("weekStartsOn");

-- CreateIndex
CREATE INDEX "FocusActivityCompletion_familyId_idx" ON "FocusActivityCompletion"("familyId");

-- CreateIndex
CREATE INDEX "FocusActivityCompletion_cubId_idx" ON "FocusActivityCompletion"("cubId");

-- CreateIndex
CREATE INDEX "FocusActivityCompletion_cardId_idx" ON "FocusActivityCompletion"("cardId");

-- CreateIndex
CREATE INDEX "FocusActivityCompletion_status_idx" ON "FocusActivityCompletion"("status");

-- CreateIndex
CREATE INDEX "FocusActivityCompletion_weekStartsOn_idx" ON "FocusActivityCompletion"("weekStartsOn");

-- CreateIndex
CREATE INDEX "XpLedgerEntry_sourceFocusActivityCompletionId_idx" ON "XpLedgerEntry"("sourceFocusActivityCompletionId");

-- CreateIndex
CREATE INDEX "FocusTokenLedgerEntry_sourceFocusActivityCompletionId_idx" ON "FocusTokenLedgerEntry"("sourceFocusActivityCompletionId");

-- CreateIndex
CREATE INDEX "PhoneTimeLedgerEntry_sourceFocusActivityCompletionId_idx" ON "PhoneTimeLedgerEntry"("sourceFocusActivityCompletionId");

-- AddForeignKey
ALTER TABLE "FocusActivityCard" ADD CONSTRAINT "FocusActivityCard_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusDeckStackItem" ADD CONSTRAINT "FocusDeckStackItem_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusDeckStackItem" ADD CONSTRAINT "FocusDeckStackItem_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusDeckStackItem" ADD CONSTRAINT "FocusDeckStackItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "FocusActivityCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusActivityCompletion" ADD CONSTRAINT "FocusActivityCompletion_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusActivityCompletion" ADD CONSTRAINT "FocusActivityCompletion_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusActivityCompletion" ADD CONSTRAINT "FocusActivityCompletion_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "FocusActivityCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusActivityCompletion" ADD CONSTRAINT "FocusActivityCompletion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpLedgerEntry" ADD CONSTRAINT "XpLedgerEntry_sourceFocusActivityCompletionId_fkey" FOREIGN KEY ("sourceFocusActivityCompletionId") REFERENCES "FocusActivityCompletion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTokenLedgerEntry" ADD CONSTRAINT "FocusTokenLedgerEntry_sourceFocusActivityCompletionId_fkey" FOREIGN KEY ("sourceFocusActivityCompletionId") REFERENCES "FocusActivityCompletion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneTimeLedgerEntry" ADD CONSTRAINT "PhoneTimeLedgerEntry_sourceFocusActivityCompletionId_fkey" FOREIGN KEY ("sourceFocusActivityCompletionId") REFERENCES "FocusActivityCompletion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
