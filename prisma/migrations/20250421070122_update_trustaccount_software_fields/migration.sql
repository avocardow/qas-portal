-- AlterTable
ALTER TABLE "trustAccounts" ADD COLUMN     "hasSoftwareAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "softwareUrl" TEXT;
