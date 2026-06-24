-- New proof types
ALTER TYPE "TaskProofType" ADD VALUE IF NOT EXISTS 'PERFORMANCE_VIDEO';
ALTER TYPE "TaskProofType" ADD VALUE IF NOT EXISTS 'SLIDESHOW';

-- Cub proof configuration
ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "proofPrompt" TEXT;
ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "proofChecklistItems" JSONB;

-- Task proof configuration + submission link
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "proofPrompt" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "proofChecklistItems" JSONB;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "proofLink" TEXT;
