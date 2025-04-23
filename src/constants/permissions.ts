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

export const TASK_PERMISSIONS = {
  GET_BY_AUDIT_ID: "task.getByAuditId",
  GET_ASSIGNED_TO_ME: "task.getAssignedToMe",
  GET_ALL: "task.getAll",
  CREATE: "task.create",
  UPDATE: "task.update",
  DELETE: "task.delete",
} as const;

export type TaskPermission =
  (typeof TASK_PERMISSIONS)[keyof typeof TASK_PERMISSIONS];

// Add document permissions for RBAC enforcement
export const DOCUMENT_PERMISSIONS = {
  GET_BY_CLIENT_ID: "document.getByClientId",
  GET_BY_AUDIT_ID: "document.getByAuditId",
  GET_BY_TASK_ID: "document.getByTaskId",
} as const;

export type DocumentPermission =
  (typeof DOCUMENT_PERMISSIONS)[keyof typeof DOCUMENT_PERMISSIONS];

export const PHONE_PERMISSIONS = {
  MAKE_CALL: "phone.makeCall",
  LOG_CALL: "phone.logCall",
} as const;

export type PhonePermission =
  (typeof PHONE_PERMISSIONS)[keyof typeof PHONE_PERMISSIONS];
