-- Expand growth areas from 5 to 7 Cub Codes (Mind, Body, Character, Responsibility, Creativity, Family, Community).
-- WELLNESS maps to BODY; existing COMMUNITY values stay COMMUNITY.

CREATE TYPE "GrowthCategory_new" AS ENUM (
  'MIND',
  'BODY',
  'CHARACTER',
  'RESPONSIBILITY',
  'CREATIVITY',
  'FAMILY',
  'COMMUNITY'
);

ALTER TABLE "Task"
  ALTER COLUMN "growthCategory" DROP DEFAULT,
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'WELLNESS' THEN 'BODY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'CREATIVITY' THEN 'CREATIVITY'
      WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
      WHEN 'COMMUNITY' THEN 'COMMUNITY'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "TaskTemplate"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'WELLNESS' THEN 'BODY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'CREATIVITY' THEN 'CREATIVITY'
      WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
      WHEN 'COMMUNITY' THEN 'COMMUNITY'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "FocusBlockLog"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'WELLNESS' THEN 'BODY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'CREATIVITY' THEN 'CREATIVITY'
      WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
      WHEN 'COMMUNITY' THEN 'COMMUNITY'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "Challenge"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'WELLNESS' THEN 'BODY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'CREATIVITY' THEN 'CREATIVITY'
      WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
      WHEN 'COMMUNITY' THEN 'COMMUNITY'
      ELSE NULL
    END
  )::"GrowthCategory_new";

ALTER TABLE "XpLedgerEntry"
  ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
  USING (
    CASE "growthCategory"::text
      WHEN 'WELLNESS' THEN 'BODY'
      WHEN 'CHARACTER' THEN 'CHARACTER'
      WHEN 'CREATIVITY' THEN 'CREATIVITY'
      WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
      WHEN 'COMMUNITY' THEN 'COMMUNITY'
      ELSE NULL
    END
  )::"GrowthCategory_new";

DROP TYPE "GrowthCategory";
ALTER TYPE "GrowthCategory_new" RENAME TO "GrowthCategory";

CREATE TYPE "FocusDeckCategory_new" AS ENUM (
  'MIND',
  'BODY',
  'CHARACTER',
  'RESPONSIBILITY',
  'CREATIVITY',
  'FAMILY',
  'COMMUNITY'
);

-- FocusActivityCard.categoryPoints is JSON; enum columns are not affected.
-- Legacy "wellness" keys in JSON are mapped at read time in application code.

ALTER TABLE "Cub"
  ALTER COLUMN "requiredGrowthCategories"
  SET DEFAULT '["MIND","BODY","CHARACTER","RESPONSIBILITY","CREATIVITY","FAMILY","COMMUNITY"]'::jsonb;

UPDATE "Cub"
SET "requiredGrowthCategories" = (
  SELECT COALESCE(
    jsonb_agg(DISTINCT mapped.value),
    '["MIND","BODY","CHARACTER","RESPONSIBILITY","CREATIVITY","FAMILY","COMMUNITY"]'::jsonb
  )
  FROM (
    SELECT CASE elem::text
      WHEN '"WELLNESS"' THEN '"BODY"'::jsonb
      WHEN '"MIND"' THEN '"MIND"'::jsonb
      WHEN '"BODY"' THEN '"BODY"'::jsonb
      WHEN '"CHARACTER"' THEN '"CHARACTER"'::jsonb
      WHEN '"RESPONSIBILITY"' THEN '"RESPONSIBILITY"'::jsonb
      WHEN '"CREATIVITY"' THEN '"CREATIVITY"'::jsonb
      WHEN '"FAMILY"' THEN '"FAMILY"'::jsonb
      WHEN '"COMMUNITY"' THEN '"COMMUNITY"'::jsonb
      ELSE NULL
    END AS value
    FROM jsonb_array_elements("requiredGrowthCategories") AS elem
  ) mapped
  WHERE mapped.value IS NOT NULL
)
WHERE "requiredGrowthCategories"::text LIKE '%WELLNESS%'
   OR jsonb_array_length("requiredGrowthCategories") < 7;

UPDATE "Cub"
SET "requiredGrowthCategories" = '["MIND","BODY","CHARACTER","RESPONSIBILITY","CREATIVITY","FAMILY","COMMUNITY"]'::jsonb
WHERE jsonb_array_length("requiredGrowthCategories") < 7;

DROP TYPE "FocusDeckCategory";
ALTER TYPE "FocusDeckCategory_new" RENAME TO "FocusDeckCategory";
