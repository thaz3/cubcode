-- Growth board: focus area swap credits on Cub + reward grant type

ALTER TYPE "RewardGrantType" ADD VALUE IF NOT EXISTS 'FOCUS_AREA_SWAP';

ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "focusAreaSwapCredits" INTEGER NOT NULL DEFAULT 0;
