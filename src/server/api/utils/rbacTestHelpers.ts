/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/api/utils/rbacTestHelpers.ts
/**
 * Helper to create mock contexts for testing RBAC middleware and utilities.
 */
export interface RBACTestContextOptions {
  role: string;
  userId?: string;
  hasPermission?: boolean;
}

export function createRBACTestContext(opts: RBACTestContextOptions) {
  const {
    role,
    userId = "00000000-0000-0000-0000-000000000000",
    hasPermission = true,
  } = opts;

  // Mock session object
  const session = {
    user: { id: userId, role },
  } as any;

  // Mock database client with rolePermission behavior
  const db = {
    rolePermission: {
      findFirst: async () => (hasPermission ? {} : null),
    },
  } as any;

  // Headers placeholder for TRPC context
  const headers = new Headers();

  return { session, db, headers };
}
