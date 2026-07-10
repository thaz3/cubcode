-- CreateTable
CREATE TABLE "ParentPinResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "ParentPinResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentPinResetToken_tokenHash_key" ON "ParentPinResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentPinResetToken_userId_idx" ON "ParentPinResetToken"("userId");

-- CreateIndex
CREATE INDEX "ParentPinResetToken_familyId_idx" ON "ParentPinResetToken"("familyId");

-- CreateIndex
CREATE INDEX "ParentPinResetToken_expiresAt_idx" ON "ParentPinResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "ParentPinResetToken" ADD CONSTRAINT "ParentPinResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentPinResetToken" ADD CONSTRAINT "ParentPinResetToken_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
