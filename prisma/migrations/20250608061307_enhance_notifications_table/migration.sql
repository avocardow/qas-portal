/*
  Warnings:

  - Added the required column `createdByUserId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('client_assignment', 'audit_assignment', 'audit_stage_update', 'audit_status_update');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "createdByUserId" UUID NOT NULL,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "notifications_type_entityId_idx" ON "notifications"("type", "entityId");

-- CreateIndex
CREATE INDEX "notifications_createdByUserId_idx" ON "notifications"("createdByUserId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
