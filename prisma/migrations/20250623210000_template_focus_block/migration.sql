-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN "focusBlockMinutes" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "focusBlockMinutes" INTEGER NOT NULL DEFAULT 20;
