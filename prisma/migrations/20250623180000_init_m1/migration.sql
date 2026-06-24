-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('LITTLE_CUBS', 'CORE_CUBS', 'TRAIL_CUBS', 'LEGACY_BUILDERS');

-- CreateEnum
CREATE TYPE "SupervisionLevel" AS ENUM ('DIRECT', 'NEARBY', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "ProofStyle" AS ENUM ('PARENT_APPROVAL', 'SHORT_REFLECTION', 'CHECKLIST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "dailyPhoneCapMinutes" INTEGER NOT NULL DEFAULT 60,
    "weekendBankCapMinutes" INTEGER NOT NULL DEFAULT 120,
    "exchangeFocusMinutes" INTEGER NOT NULL DEFAULT 30,
    "exchangePhoneMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cub" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "ageBand" "AgeBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "Cub_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Family_ownerId_key" ON "Family"("ownerId");

-- CreateIndex
CREATE INDEX "Cub_familyId_idx" ON "Cub"("familyId");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cub" ADD CONSTRAINT "Cub_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
