-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "assignedUserId" UUID;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
