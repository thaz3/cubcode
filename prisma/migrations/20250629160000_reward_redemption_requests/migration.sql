-- CreateEnum
CREATE TYPE "RewardRedemptionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RewardRedemptionRequest" (
    "id" TEXT NOT NULL,
    "status" "RewardRedemptionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT NOT NULL,
    "rewardStoreItemId" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "reviewedByUserId" TEXT,

    CONSTRAINT "RewardRedemptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RewardRedemptionRequest_familyId_status_idx" ON "RewardRedemptionRequest"("familyId", "status");

-- CreateIndex
CREATE INDEX "RewardRedemptionRequest_cubId_idx" ON "RewardRedemptionRequest"("cubId");

-- CreateIndex
CREATE INDEX "RewardRedemptionRequest_rewardStoreItemId_idx" ON "RewardRedemptionRequest"("rewardStoreItemId");

-- AddForeignKey
ALTER TABLE "RewardRedemptionRequest" ADD CONSTRAINT "RewardRedemptionRequest_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemptionRequest" ADD CONSTRAINT "RewardRedemptionRequest_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemptionRequest" ADD CONSTRAINT "RewardRedemptionRequest_rewardStoreItemId_fkey" FOREIGN KEY ("rewardStoreItemId") REFERENCES "RewardStoreItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemptionRequest" ADD CONSTRAINT "RewardRedemptionRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemptionRequest" ADD CONSTRAINT "RewardRedemptionRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
