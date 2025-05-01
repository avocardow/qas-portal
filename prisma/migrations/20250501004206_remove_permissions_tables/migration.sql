/*
  Warnings:

  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rolePermissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "rolePermissions" DROP CONSTRAINT "rolePermissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "rolePermissions" DROP CONSTRAINT "rolePermissions_roleId_fkey";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "rolePermissions";
