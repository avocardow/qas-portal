// Load environment variables
import 'dotenv/config';
// Additional logging to trace execution
console.log('Starting permissions migration script...');

import { PrismaClient } from '@prisma/client';
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
} from '../src/constants/permissions';
import { rbacPolicy } from '../src/utils/rbacPolicy';

/**
 * This script backfills the Supabase `permissions` and `rolePermissions` tables
 * using existing constants and rbacPolicy mapping.
 *
 * Assumes:
 *  - `permissions` table has columns: id (Int PK), action (String unique), description (String?)
 *  - `roles` table has columns: id (Int PK), name (String unique)
 *  - `rolePermissions` table has composite PK [roleId, permissionId]
 */

(async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Connecting to database...');
    // test connection
    await prisma.$connect();
    console.log('Connected to database');

    // 1. Backfill permissions
    const permissionActions = [
      ...Object.values(AUDIT_PERMISSIONS),
      ...Object.values(TASK_PERMISSIONS),
      ...Object.values(DOCUMENT_PERMISSIONS),
      ...Object.values(PHONE_PERMISSIONS),
    ];
    console.log(`Upserting ${permissionActions.length} permission actions...`);
    for (const action of permissionActions) {
      await prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      });
      console.log(`Upserted permission: ${action}`);
    }

    // 2. Backfill role-permissions
    for (const [roleName, actions] of Object.entries(rbacPolicy)) {
      console.log(`Processing role: ${roleName} with ${actions.length} permissions`);
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        console.warn(`Role '${roleName}' not found in 'roles' table.`);
        continue;
      }
      for (const action of actions) {
        const permission = await prisma.permission.findUnique({ where: { action } });
        if (!permission) {
          console.warn(`Permission '${action}' not found in 'permissions' table.`);
          continue;
        }
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        console.log(`Associated ${roleName} -> ${action}`);
      }
    }

    console.log('Permissions migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 