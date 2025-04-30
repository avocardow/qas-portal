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

// Permissions for managing Role-Permission mappings
export const ROLE_PERMISSION_PERMISSIONS = {
  GET_ALL: "rolePermission.getAll",
  ASSIGN: "rolePermission.assign",
  UNASSIGN: "rolePermission.unassign",
} as const;

export type RolePermissionPermission =
  (typeof ROLE_PERMISSION_PERMISSIONS)[keyof typeof ROLE_PERMISSION_PERMISSIONS];

// Add client-specific permissions for gating table columns
export const CLIENT_PERMISSIONS = {
  VIEW: "clients.view",
  VIEW_BILLING: "clients.view.billing",
  VIEW_STATUS: "clients.view.status",
} as const;

export type ClientPermission =
  (typeof CLIENT_PERMISSIONS)[keyof typeof CLIENT_PERMISSIONS];

// Permissions for navigation menu items
export const NAV_PERMISSIONS = {
  TEAM_EMAIL: 'nav.team.email',
  TEAM_TASKS: 'nav.team.tasks',
  TEAM_SETTINGS: 'nav.team.settings',
  TEAM_ACCOUNT: 'nav.team.account',
  TEAM_PHONE: 'nav.team.phone',
  TEAM_INVOICES: 'nav.team.invoices',
  TEAM_FILES: 'nav.team.files',
  TEAM_DASHBOARD: 'nav.team.dashboard',
  TEAM_CLIENTS: 'nav.team.clients',
  TEAM_CONTACTS: 'nav.team.contacts',
  TEAM_CHAT: 'nav.team.chat',
  TEAM_CALENDAR: 'nav.team.calendar',
  TEAM_AUDITS: 'nav.team.audits',
  CLIENT_DOCUMENTS: 'nav.client.documents',
  CLIENT_PROFILE: 'nav.client.profile',
  CLIENT_HOME: 'nav.client.home',
  CLIENT_BILLING: 'nav.client.billing',
  // Permission to view section headings in navigation sidebar
  PAGE_HEADINGS: 'nav.page.headings',
} as const;

export type NavPermission = (typeof NAV_PERMISSIONS)[keyof typeof NAV_PERMISSIONS];
