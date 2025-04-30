/*
  Warnings:

  - The values [call_logged] on the enum `ActivityLogType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sharepointFolderId` on the `clients` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityLogType_new" AS ENUM ('note', 'email_sent', 'email_received', 'call_in', 'call_out', 'status_change', 'stage_change', 'document_request', 'document_received', 'document_signed', 'task_created', 'task_completed', 'meeting_summary', 'billing_commentary');
ALTER TABLE "activityLogs" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "activityLogs" ALTER COLUMN "type" TYPE "ActivityLogType_new" USING ("type"::text::"ActivityLogType_new");
ALTER TYPE "ActivityLogType" RENAME TO "ActivityLogType_old";
ALTER TYPE "ActivityLogType_new" RENAME TO "ActivityLogType";
DROP TYPE "ActivityLogType_old";
ALTER TABLE "activityLogs" ALTER COLUMN "type" SET DEFAULT 'note';
COMMIT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "sharepointFolderId",
ADD COLUMN     "externalFolderId" TEXT,
ADD COLUMN     "internalFolderId" TEXT;
