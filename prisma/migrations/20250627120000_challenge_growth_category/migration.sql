-- Optional growth area tag on repeating routines

ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "growthCategory" "GrowthCategory";
