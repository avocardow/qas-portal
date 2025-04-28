// Removed import of Permission type; using string[] for permission lists
import { PrismaClient } from '@prisma/client';
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
  ROLE_PERMISSION_PERMISSIONS
} from '../src/constants/permissions';

async function main() {
  // Aggregate all permission constants from code
  const codePermissions = [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    ...Object.values(DOCUMENT_PERMISSIONS),
    ...Object.values(PHONE_PERMISSIONS),
    ...Object.values(ROLE_PERMISSION_PERMISSIONS)
  ];
  const uniqueCodePerms = Array.from(new Set(codePermissions));

  // Fetch permissions from database
  const prisma = new PrismaClient();
  const dbPerms = await prisma.permission.findMany();
  const dbActions = dbPerms.map(p => p.action);

  // Determine missing and unused permissions
  const missing = uniqueCodePerms.filter(p => !dbActions.includes(p));
  const unused = dbActions.filter(p => !uniqueCodePerms.includes(p));

  // Report missing permissions
  if (missing.length > 0) {
    console.error('Error: The following permissions defined in code are missing from the database:');
    missing.forEach(p => console.error('  -', p));
  } else {
    console.log('All code permissions are present in the database.');
  }

  // Report unused permissions
  if (unused.length > 0) {
    console.warn('Warning: The following permissions exist in the database but are not referenced in the code:');
    unused.forEach(p => console.warn('  -', p));
  } else {
    console.log('No unused permissions found.');
  }

  // Exit with error code if missing permissions exist
  process.exit(missing.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Error running permission validation:', error);
  process.exit(1);
}); 