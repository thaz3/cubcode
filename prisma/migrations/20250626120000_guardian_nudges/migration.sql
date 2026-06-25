-- CreateEnum
CREATE TYPE "GuardianNudgeRuleType" AS ENUM ('NOT_STARTED_BEFORE_DUE', 'OVERDUE_NOT_STARTED', 'SUBMITTED_FOR_REVIEW', 'DAILY_SUMMARY');
CREATE TYPE "GuardianNudgeStatus" AS ENUM ('ACTIVE', 'SEEN', 'DISMISSED');

-- CreateTable
CREATE TABLE "GuardianNudgePreferences" (
    "id" TEXT NOT NULL,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "dailySummaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailySummaryTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "GuardianNudgePreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianNudgeRule" (
    "id" TEXT NOT NULL,
    "type" "GuardianNudgeRuleType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "offsetMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "GuardianNudgeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianNudge" (
    "id" TEXT NOT NULL,
    "type" "GuardianNudgeRuleType" NOT NULL,
    "status" "GuardianNudgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "message" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "taskId" TEXT,
    "cubId" TEXT,
    "ruleId" TEXT,

    CONSTRAINT "GuardianNudge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianNudgePreferences_familyId_key" ON "GuardianNudgePreferences"("familyId");
CREATE UNIQUE INDEX "GuardianNudgeRule_familyId_type_key" ON "GuardianNudgeRule"("familyId", "type");
CREATE INDEX "GuardianNudgeRule_familyId_idx" ON "GuardianNudgeRule"("familyId");
CREATE UNIQUE INDEX "GuardianNudge_familyId_dedupeKey_key" ON "GuardianNudge"("familyId", "dedupeKey");
CREATE INDEX "GuardianNudge_familyId_status_idx" ON "GuardianNudge"("familyId", "status");
CREATE INDEX "GuardianNudge_taskId_idx" ON "GuardianNudge"("taskId");

-- AddForeignKey
ALTER TABLE "GuardianNudgePreferences" ADD CONSTRAINT "GuardianNudgePreferences_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianNudgeRule" ADD CONSTRAINT "GuardianNudgeRule_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianNudge" ADD CONSTRAINT "GuardianNudge_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianNudge" ADD CONSTRAINT "GuardianNudge_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianNudge" ADD CONSTRAINT "GuardianNudge_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
