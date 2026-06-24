-- Move proof configuration from Cub to TaskTemplate.

ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "proofType" "TaskProofType";
ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "proofPrompt" TEXT;
ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "proofChecklistItems" JSONB;

UPDATE "TaskTemplate"
SET "proofType" = 'SHORT_REFLECTION'
WHERE "proofType" IS NULL;

ALTER TABLE "TaskTemplate" ALTER COLUMN "proofType" SET DEFAULT 'SHORT_REFLECTION';
ALTER TABLE "TaskTemplate" ALTER COLUMN "proofType" SET NOT NULL;

ALTER TABLE "Cub" DROP COLUMN IF EXISTS "proofType";
ALTER TABLE "Cub" DROP COLUMN IF EXISTS "proofPrompt";
ALTER TABLE "Cub" DROP COLUMN IF EXISTS "proofChecklistItems";
