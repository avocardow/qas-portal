-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "invoiceIssueDate" TIMESTAMPTZ,
ADD COLUMN     "invoicePaid" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
