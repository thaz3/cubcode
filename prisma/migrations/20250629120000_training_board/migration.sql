-- Training Board: milestone decks linked to focus cards and assignments

CREATE TABLE "TrainingDeck" (
    "id" TEXT NOT NULL,
    "milestoneNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "TrainingDeck_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainingDeck_familyId_slug_key" ON "TrainingDeck"("familyId", "slug");
CREATE INDEX "TrainingDeck_familyId_idx" ON "TrainingDeck"("familyId");

ALTER TABLE "TrainingDeck" ADD CONSTRAINT "TrainingDeck_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FocusActivityCard" ADD COLUMN "trainingDeckId" TEXT;
ALTER TABLE "FocusActivityCard" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "FocusActivityCard_trainingDeckId_idx" ON "FocusActivityCard"("trainingDeckId");
ALTER TABLE "FocusActivityCard" ADD CONSTRAINT "FocusActivityCard_trainingDeckId_fkey" FOREIGN KEY ("trainingDeckId") REFERENCES "TrainingDeck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD COLUMN "focusActivityCardId" TEXT;
ALTER TABLE "Task" ADD COLUMN "trainingDeckId" TEXT;
CREATE INDEX "Task_focusActivityCardId_idx" ON "Task"("focusActivityCardId");
CREATE INDEX "Task_trainingDeckId_idx" ON "Task"("trainingDeckId");
ALTER TABLE "Task" ADD CONSTRAINT "Task_focusActivityCardId_fkey" FOREIGN KEY ("focusActivityCardId") REFERENCES "FocusActivityCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_trainingDeckId_fkey" FOREIGN KEY ("trainingDeckId") REFERENCES "TrainingDeck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
