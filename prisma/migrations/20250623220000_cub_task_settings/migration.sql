-- Cub task settings (per child)
ALTER TABLE "Cub" ADD COLUMN "focusBlockMinutes" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "Cub" ADD COLUMN "proofType" "TaskProofType" NOT NULL DEFAULT 'SHORT_REFLECTION';
ALTER TABLE "Cub" ADD COLUMN "suggestedXp" INTEGER;
ALTER TABLE "Cub" ADD COLUMN "suggestedFocusTokens" INTEGER;
ALTER TABLE "Cub" ADD COLUMN "suggestedPhoneMinutes" INTEGER;

-- Templates: title + description only
ALTER TABLE "TaskTemplate" DROP COLUMN IF EXISTS "proofType";
ALTER TABLE "TaskTemplate" DROP COLUMN IF EXISTS "focusBlockMinutes";
ALTER TABLE "TaskTemplate" DROP COLUMN IF EXISTS "suggestedXp";
ALTER TABLE "TaskTemplate" DROP COLUMN IF EXISTS "suggestedFocusTokens";
ALTER TABLE "TaskTemplate" DROP COLUMN IF EXISTS "suggestedPhoneMinutes";
