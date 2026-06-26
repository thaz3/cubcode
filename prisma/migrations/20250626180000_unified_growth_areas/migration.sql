-- Unify Cub Code growth areas with Growth Pick taxonomy (5 areas).

CREATE TYPE "GrowthCategory_new" AS ENUM (
  'CHARACTER',
  'WELLNESS',
  'CREATIVITY',
  'RESPONSIBILITY',
  'COMMUNITY'
);

ALTER TABLE "Task"
  ALTER COLUMN "growthCategory" DROP DEFAULT,
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'CONTROL' THEN 'RESPONSIBILITY'
      WHEN 'USE' THEN 'CREATIVITY'
      WHEN 'BUILD' THEN 'CREATIVITY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'WELLNESS' THEN 'WELLNESS'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "TaskTemplate"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'CONTROL' THEN 'RESPONSIBILITY'
      WHEN 'USE' THEN 'CREATIVITY'
      WHEN 'BUILD' THEN 'CREATIVITY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'WELLNESS' THEN 'WELLNESS'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "FocusBlockLog"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'CONTROL' THEN 'RESPONSIBILITY'
      WHEN 'USE' THEN 'CREATIVITY'
      WHEN 'BUILD' THEN 'CREATIVITY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'WELLNESS' THEN 'WELLNESS'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "Challenge"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'CONTROL' THEN 'RESPONSIBILITY'
      WHEN 'USE' THEN 'CREATIVITY'
      WHEN 'BUILD' THEN 'CREATIVITY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'WELLNESS' THEN 'WELLNESS'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "XpLedgerEntry"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'CONTROL' THEN 'RESPONSIBILITY'
      WHEN 'USE' THEN 'CREATIVITY'
      WHEN 'BUILD' THEN 'CREATIVITY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'WELLNESS' THEN 'WELLNESS'
      ELSE NULL
    END
  )::"GrowthCategory_new";

DROP TYPE "GrowthCategory";

ALTER TYPE "GrowthCategory_new" RENAME TO "GrowthCategory";

ALTER TABLE "Cub"
  ALTER COLUMN "requiredGrowthCategories"
  SET DEFAULT '["CHARACTER","WELLNESS","CREATIVITY","RESPONSIBILITY","COMMUNITY"]'::jsonb;

UPDATE "Cub"
SET "requiredGrowthCategories" = '["CHARACTER","WELLNESS","CREATIVITY","RESPONSIBILITY","COMMUNITY"]'::jsonb;
