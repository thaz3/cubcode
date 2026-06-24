-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('AVAILABLE', 'CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'SENT_BACK', 'REJECTED', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskProofType" AS ENUM ('PARENT_APPROVAL', 'SHORT_REFLECTION', 'CHECKLIST', 'TIME_LOG');

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "proofType" "TaskProofType" NOT NULL DEFAULT 'SHORT_REFLECTION',
    "suggestedXp" INTEGER,
    "suggestedFocusTokens" INTEGER,
    "suggestedPhoneMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "proofType" "TaskProofType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reflection" TEXT,
    "checklistData" JSONB,
    "timeLoggedMinutes" INTEGER,
    "reviewNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,
    "cubId" TEXT,
    "templateId" TEXT,
    "reviewedByUserId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusBlockLog" (
    "id" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cubId" TEXT NOT NULL,
    "taskId" TEXT,

    CONSTRAINT "FocusBlockLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTemplate_familyId_idx" ON "TaskTemplate"("familyId");

-- CreateIndex
CREATE INDEX "Task_familyId_idx" ON "Task"("familyId");

-- CreateIndex
CREATE INDEX "Task_cubId_idx" ON "Task"("cubId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "FocusBlockLog_cubId_idx" ON "FocusBlockLog"("cubId");

-- CreateIndex
CREATE INDEX "FocusBlockLog_taskId_idx" ON "FocusBlockLog"("taskId");

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusBlockLog" ADD CONSTRAINT "FocusBlockLog_cubId_fkey" FOREIGN KEY ("cubId") REFERENCES "Cub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusBlockLog" ADD CONSTRAINT "FocusBlockLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
