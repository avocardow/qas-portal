# Permission Middleware Usages Inventory

Below is a list of all instances of `enforcePermission(...)` middleware across the codebase, including file path, line number, and permission constant used.

- **src/server/api/routers/audit.ts**
  - Line 40: `.use(enforcePermission(AUDIT_PERMISSIONS.CREATE))`
  - Line 63: `.use(enforcePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS))`
  - Line 87: `.use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))`
  - Line 109: `.use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_ID))`
  - Line 141: `.use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))`
  - Line 151: `.use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))`
  - Line 160: `.use(enforcePermission(AUDIT_PERMISSIONS.ASSIGN_USER))`
  - Line 186: `.use(enforcePermission(AUDIT_PERMISSIONS.UNASSIGN_USER))`

- **src/server/api/trpc.ts**
  - Line 189: `protectedProcedure.use(enforcePermission(permission))` (default permission middleware for protectedProcedure) 