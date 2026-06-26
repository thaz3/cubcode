-- AlterTable
ALTER TABLE "CouncilDayCubEntry" ADD COLUMN "bonusPhoneMinutesGranted" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PhoneTimeLedgerEntry" ADD COLUMN "councilDayCubEntryId" TEXT;

-- CreateIndex
CREATE INDEX "PhoneTimeLedgerEntry_councilDayCubEntryId_idx" ON "PhoneTimeLedgerEntry"("councilDayCubEntryId");

-- AddForeignKey
ALTER TABLE "PhoneTimeLedgerEntry" ADD CONSTRAINT "PhoneTimeLedgerEntry_councilDayCubEntryId_fkey" FOREIGN KEY ("councilDayCubEntryId") REFERENCES "CouncilDayCubEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
