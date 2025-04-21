// Constants defining audit-related RBAC permission actions.
export const AUDIT_PERMISSIONS = {
  CREATE: "audit.create",
  UPDATE_STAGE_STATUS: "audit.updateStageStatus",
  GET_BY_CLIENT_ID: "audit.getByClientId",
  GET_BY_ID: "audit.getById",
  ASSIGN_USER: "audit.assignUser",
  UNASSIGN_USER: "audit.unassignUser",
} as const;

export type AuditPermission =
  (typeof AUDIT_PERMISSIONS)[keyof typeof AUDIT_PERMISSIONS];
