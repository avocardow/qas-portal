src/server/api/routers/audit.ts:5:  enforcePermission,
src/server/api/routers/audit.ts:40:    .use(enforcePermission(AUDIT_PERMISSIONS.CREATE))
src/server/api/routers/audit.ts:63:    .use(enforcePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS))
src/server/api/routers/audit.ts:87:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:109:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_ID))
src/server/api/routers/audit.ts:141:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:151:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:160:    .use(enforcePermission(AUDIT_PERMISSIONS.ASSIGN_USER))
src/server/api/routers/audit.ts:186:    .use(enforcePermission(AUDIT_PERMISSIONS.UNASSIGN_USER))
src/server/api/trpc.ts:156:export const enforcePermission = (permission: string) =>
src/server/api/trpc.ts:189:  protectedProcedure.use(enforcePermission(permission));
