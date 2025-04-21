/*
  Warnings:

  - You are about to drop the column `agreedFee` on the `audits` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `audits` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `softwareAccess` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `licenses` table. All the data in the column will be lost.
  - You are about to alter the column `renewalMonth` on the `licenses` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to drop the column `accountNumberMasked` on the `trustAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `trustAccounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licenseNumber]` on the table `licenses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('note', 'email_sent', 'email_received', 'call_logged', 'status_change', 'stage_change', 'document_request', 'document_received', 'document_signed', 'task_created', 'task_completed', 'meeting_summary');

-- AlterTable
ALTER TABLE "audits" DROP COLUMN "agreedFee",
DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "notes",
DROP COLUMN "softwareAccess";

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "licenses" DROP COLUMN "expiryDate",
DROP COLUMN "notes",
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "renewalMonth" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "trustAccounts" DROP COLUMN "accountNumberMasked",
DROP COLUMN "notes",
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "managementSoftware" TEXT,
ADD COLUMN     "primaryLicenseId" UUID;

-- CreateTable
CREATE TABLE "activityLogs" (
    "id" UUID NOT NULL,
    "auditId" UUID,
    "clientId" UUID NOT NULL,
    "taskId" UUID,
    "contactId" UUID,
    "userId" UUID NOT NULL,
    "type" "ActivityLogType" NOT NULL DEFAULT 'note',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "clientId" UUID,
    "contactId" UUID,
    "auditId" UUID,
    "taskId" UUID,
    "licenseId" UUID,
    "trustAccountId" UUID,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activityLogs_auditId_idx" ON "activityLogs"("auditId");

-- CreateIndex
CREATE INDEX "activityLogs_clientId_idx" ON "activityLogs"("clientId");

-- CreateIndex
CREATE INDEX "activityLogs_taskId_idx" ON "activityLogs"("taskId");

-- CreateIndex
CREATE INDEX "activityLogs_userId_idx" ON "activityLogs"("userId");

-- CreateIndex
CREATE INDEX "activityLogs_type_idx" ON "activityLogs"("type");

-- CreateIndex
CREATE INDEX "activityLogs_createdAt_idx" ON "activityLogs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "notes_clientId_idx" ON "notes"("clientId");

-- CreateIndex
CREATE INDEX "notes_contactId_idx" ON "notes"("contactId");

-- CreateIndex
CREATE INDEX "notes_auditId_idx" ON "notes"("auditId");

-- CreateIndex
CREATE INDEX "notes_taskId_idx" ON "notes"("taskId");

-- CreateIndex
CREATE INDEX "notes_licenseId_idx" ON "notes"("licenseId");

-- CreateIndex
CREATE INDEX "notes_trustAccountId_idx" ON "notes"("trustAccountId");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_licenseNumber_key" ON "licenses"("licenseNumber");

-- CreateIndex
CREATE INDEX "trustAccounts_primaryLicenseId_idx" ON "trustAccounts"("primaryLicenseId");

-- AddForeignKey
ALTER TABLE "trustAccounts" ADD CONSTRAINT "trustAccounts_primaryLicenseId_fkey" FOREIGN KEY ("primaryLicenseId") REFERENCES "licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_trustAccountId_fkey" FOREIGN KEY ("trustAccountId") REFERENCES "trustAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
