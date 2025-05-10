-- AlterTable
ALTER TABLE "activityLogs" ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "modifiedBy" UUID;
