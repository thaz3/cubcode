-- Raise default daily phone cap from 60 to 120 minutes (2 hours)
ALTER TABLE "Family" ALTER COLUMN "dailyPhoneCapMinutes" SET DEFAULT 120;

UPDATE "Family"
SET "dailyPhoneCapMinutes" = 120
WHERE "dailyPhoneCapMinutes" = 60;

UPDATE "Cub"
SET "dailyPhoneCapMinutes" = 120
WHERE "dailyPhoneCapMinutes" = 60;
