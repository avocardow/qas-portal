/*
  Warnings:

  - You are about to drop the column `userId` on the `activityLogs` table. All the data in the column will be lost.
  - You are about to drop the column `externalFolderId` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `internalFolderId` on the `clients` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityLogType" ADD VALUE 'external_folder_instructions';
ALTER TYPE "ActivityLogType" ADD VALUE 'software_access_instructions';

-- DropForeignKey
ALTER TABLE "activityLogs" DROP CONSTRAINT "activityLogs_userId_fkey";

-- DropIndex
DROP INDEX "activityLogs_userId_idx";

-- AlterTable
ALTER TABLE "activityLogs" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "externalFolderId",
DROP COLUMN "internalFolderId",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "externalFolder" TEXT,
ADD COLUMN     "internalFolder" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "activityLogs_createdBy_idx" ON "activityLogs"("createdBy");

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
