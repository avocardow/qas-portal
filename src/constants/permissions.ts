// Constants defining audit-related RBAC permission actions.
export const AUDIT_PERMISSIONS = {
  CREATE: "audit.create",
  UPDATE_STAGE_STATUS: "audit.updateStageStatus",
  GET_BY_CLIENT_ID: "audit.getByClientId",
  GET_BY_ID: "audit.getById",
  ASSIGN_USER: "audit.assignUser",
  UNASSIGN_USER: "audit.unassignUser",
  EDIT: "audits.edit",
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

// Add client-specific permissions for gating table columns
export const CLIENT_PERMISSIONS = {
  VIEW: "clients.view",
  VIEW_BILLING: "clients.view.billing",
  VIEW_STATUS: "clients.view.status",
  EDIT: "clients.edit",
  ARCHIVE: "clients.archive",
} as const;

export type ClientPermission =
  (typeof CLIENT_PERMISSIONS)[keyof typeof CLIENT_PERMISSIONS];

export const CONTACT_PERMISSIONS = {
  EDIT: "contacts.edit",
} as const;

export type ContactPermission =
  (typeof CONTACT_PERMISSIONS)[keyof typeof CONTACT_PERMISSIONS];

export const TRUST_ACCOUNTS_PERMISSIONS = {
  EDIT: "trust_accounts.edit",
} as const;

export type TrustAccountPermission =
  (typeof TRUST_ACCOUNTS_PERMISSIONS)[keyof typeof TRUST_ACCOUNTS_PERMISSIONS];

// Permissions for activity log operations
export const ACTIVITY_PERMISSIONS = {
  ADD_BILLING_COMMENTARY: 'activity.add.billing_commentary',
  ADD_EXTERNAL_FOLDER_INSTRUCTIONS: 'activity.add.external_folder_instructions',
  ADD_SOFTWARE_ACCESS_INSTRUCTIONS: 'activity.add.software_access_instructions',
} as const;

export type ActivityPermission =
  (typeof ACTIVITY_PERMISSIONS)[keyof typeof ACTIVITY_PERMISSIONS];

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

export const IMPERSONATION_PERMISSIONS = {
  USE: 'impersonation.use',
} as const;

export type ImpersonationPermission = (typeof IMPERSONATION_PERMISSIONS)[keyof typeof IMPERSONATION_PERMISSIONS];

export type NavPermission = (typeof NAV_PERMISSIONS)[keyof typeof NAV_PERMISSIONS];
