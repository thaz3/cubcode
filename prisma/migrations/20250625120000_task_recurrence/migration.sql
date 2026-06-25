-- CreateEnum
CREATE TYPE "TaskRecurrence" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "recurrence" "TaskRecurrence" NOT NULL DEFAULT 'NONE';
ALTER TABLE "TaskTemplate" ADD COLUMN "recurrence" "TaskRecurrence" NOT NULL DEFAULT 'NONE';
