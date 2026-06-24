-- Task categories: Focus Block, School, Chore, Attitude

CREATE TYPE "TaskCategory" AS ENUM ('FOCUS_BLOCK', 'SCHOOL', 'CHORE', 'ATTITUDE');
CREATE TYPE "GrowthCategory" AS ENUM ('CONTROL', 'USE', 'BUILD', 'CHARACTER', 'WELLNESS');

ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "category" "TaskCategory";
ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "TaskTemplate" ADD COLUMN IF NOT EXISTS "growthCategory" "GrowthCategory";

UPDATE "TaskTemplate" SET "category" = 'CHORE' WHERE "category" IS NULL;
ALTER TABLE "TaskTemplate" ALTER COLUMN "category" SET DEFAULT 'CHORE';
ALTER TABLE "TaskTemplate" ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "category" "TaskCategory";
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "growthCategory" "GrowthCategory";

UPDATE "Task" SET "category" = 'CHORE' WHERE "category" IS NULL;
ALTER TABLE "Task" ALTER COLUMN "category" SET DEFAULT 'CHORE';
ALTER TABLE "Task" ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "FocusBlockLog" ADD COLUMN IF NOT EXISTS "growthCategory" "GrowthCategory";
