-- AlterEnum
ALTER TYPE "LedgerReason" ADD VALUE 'COUNCIL_DAY';

-- CreateTable
CREATE TABLE "CouncilDaySession" (
    "id" TEXT NOT NULL,
    "weekStartsOn" TIMESTAMP(3) NOT NULL,
    "familyNotes" TEXT,
    "conductedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "conductedByUserId" TEXT,

    CONSTRAINT "CouncilDaySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilDayCubEntry" (
    "id" TEXT NOT NULL,
    "winNote" TEXT,
    "growNote" TEXT,
    "familyGoalNote" TEXT,
    "reflection" TEXT,
    "bonusXpGranted" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensGranted" INTEGER NOT NULL DEFAULT 0,
    "bonusGrantedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,

    CONSTRAINT "CouncilDayCubEntry_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "XpLedgerEntry" ADD COLUMN "councilDayCubEntryId" TEXT;

-- AlterTable
ALTER TABLE "FocusTokenLedgerEntry" ADD COLUMN "councilDayCubEntryId" TEXT;

-- CreateIndex
CREATE INDEX "CouncilDaySession_familyId_idx" ON "CouncilDaySession"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "CouncilDaySession_familyId_weekStartsOn_key" ON "CouncilDaySession"("familyId", "weekStartsOn");

-- CreateIndex
CREATE INDEX "CouncilDayCubEntry_cubId_idx" ON "CouncilDayCubEntry"("cubId");

-- CreateIndex
CREATE UNIQUE INDEX "CouncilDayCubEntry_sessionId_cubId_key" ON "CouncilDayCubEntry"("sessionId", "cubId");

-- CreateIndex
CREATE INDEX "XpLedgerEntry_councilDayCubEntryId_idx" ON "XpLedgerEntry"("councilDayCubEntryId");

-- CreateIndex
CREATE INDEX "FocusTokenLedgerEntry_councilDayCubEntryId_idx" ON "FocusTokenLedgerEntry"("councilDayCubEntryId");

-- AddForeignKey
ALTER TABLE "CouncilDaySession" ADD CONSTRAINT "CouncilDaySession_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilDaySession" ADD CONSTRAINT "CouncilDaySession_conductedByUserId_fkey" FOREIGN KEY ("conductedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilDayCubEntry" ADD CONSTRAINT "CouncilDayCubEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CouncilDaySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilDayCubEntry" ADD CONSTRAINT "CouncilDayCubEntry_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpLedgerEntry" ADD CONSTRAINT "XpLedgerEntry_councilDayCubEntryId_fkey" FOREIGN KEY ("councilDayCubEntryId") REFERENCES "CouncilDayCubEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTokenLedgerEntry" ADD CONSTRAINT "FocusTokenLedgerEntry_councilDayCubEntryId_fkey" FOREIGN KEY ("councilDayCubEntryId") REFERENCES "CouncilDayCubEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
