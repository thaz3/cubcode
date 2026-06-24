-- Per-task earned rewards on Cub and Task; remove focus block length and cub-level exchange fields.

ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "focusMinutesEarned" INTEGER;
ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "phoneMinutesEarned" INTEGER;
ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "xpEarned" INTEGER;
ALTER TABLE "Cub" ADD COLUMN IF NOT EXISTS "focusTokensEarned" INTEGER;

UPDATE "Cub"
SET
  "focusMinutesEarned" = COALESCE("exchangeFocusMinutes", "focusBlockMinutes", 30),
  "phoneMinutesEarned" = COALESCE("exchangePhoneMinutes", 15),
  "xpEarned" = 10,
  "focusTokensEarned" = 1
WHERE "focusMinutesEarned" IS NULL;

ALTER TABLE "Cub" ALTER COLUMN "focusMinutesEarned" SET DEFAULT 30;
ALTER TABLE "Cub" ALTER COLUMN "focusMinutesEarned" SET NOT NULL;
ALTER TABLE "Cub" ALTER COLUMN "phoneMinutesEarned" SET DEFAULT 15;
ALTER TABLE "Cub" ALTER COLUMN "phoneMinutesEarned" SET NOT NULL;
ALTER TABLE "Cub" ALTER COLUMN "xpEarned" SET DEFAULT 10;
ALTER TABLE "Cub" ALTER COLUMN "xpEarned" SET NOT NULL;
ALTER TABLE "Cub" ALTER COLUMN "focusTokensEarned" SET DEFAULT 1;
ALTER TABLE "Cub" ALTER COLUMN "focusTokensEarned" SET NOT NULL;

ALTER TABLE "Cub" DROP COLUMN IF EXISTS "focusBlockMinutes";
ALTER TABLE "Cub" DROP COLUMN IF EXISTS "exchangeFocusMinutes";
ALTER TABLE "Cub" DROP COLUMN IF EXISTS "exchangePhoneMinutes";

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "focusMinutesEarned" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "phoneMinutesEarned" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "xpEarned" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "focusTokensEarned" INTEGER;

UPDATE "Task"
SET
  "focusMinutesEarned" = COALESCE("focusBlockMinutes", 30),
  "phoneMinutesEarned" = 15,
  "xpEarned" = 10,
  "focusTokensEarned" = 1
WHERE "focusMinutesEarned" IS NULL;

ALTER TABLE "Task" ALTER COLUMN "focusMinutesEarned" SET DEFAULT 30;
ALTER TABLE "Task" ALTER COLUMN "focusMinutesEarned" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "phoneMinutesEarned" SET DEFAULT 15;
ALTER TABLE "Task" ALTER COLUMN "phoneMinutesEarned" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "xpEarned" SET DEFAULT 10;
ALTER TABLE "Task" ALTER COLUMN "xpEarned" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "focusTokensEarned" SET DEFAULT 1;
ALTER TABLE "Task" ALTER COLUMN "focusTokensEarned" SET NOT NULL;

ALTER TABLE "Task" DROP COLUMN IF EXISTS "focusBlockMinutes";
