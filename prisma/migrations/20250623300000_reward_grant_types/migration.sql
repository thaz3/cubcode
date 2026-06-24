-- CreateEnum
CREATE TYPE "RewardGrantType" AS ENUM ('NONE', 'PHONE_TIME', 'WEEKEND_BANK');

-- AlterTable
ALTER TABLE "RewardStoreItem" ADD COLUMN "grantType" "RewardGrantType" NOT NULL DEFAULT 'NONE';
ALTER TABLE "RewardStoreItem" ADD COLUMN "minutesGranted" INTEGER;

-- AlterTable
ALTER TABLE "RewardRedemption" ADD COLUMN "phoneMinutesGranted" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RewardRedemption" ADD COLUMN "weekendBankMinutesGranted" INTEGER NOT NULL DEFAULT 0;

-- Backfill default phone-time reward
UPDATE "RewardStoreItem"
SET "grantType" = 'PHONE_TIME', "minutesGranted" = 15
WHERE title = 'Extra 15 min phone time' AND "minutesGranted" IS NULL;
