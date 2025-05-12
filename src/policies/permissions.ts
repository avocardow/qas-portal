import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
  CLIENT_PERMISSIONS,
  CONTACT_PERMISSIONS,
  TRUST_ACCOUNTS_PERMISSIONS,
  ACTIVITY_PERMISSIONS,
  NAV_PERMISSIONS,
  IMPERSONATION_PERMISSIONS,
} from '../constants/permissions.ts';

/**
 * Permission type representing all possible permission strings.
 */
export type Permission =
  | (typeof AUDIT_PERMISSIONS)[keyof typeof AUDIT_PERMISSIONS]
  | (typeof TASK_PERMISSIONS)[keyof typeof TASK_PERMISSIONS]
  | (typeof DOCUMENT_PERMISSIONS)[keyof typeof DOCUMENT_PERMISSIONS]
  | (typeof PHONE_PERMISSIONS)[keyof typeof PHONE_PERMISSIONS]
  | (typeof CLIENT_PERMISSIONS)[keyof typeof CLIENT_PERMISSIONS]
  | (typeof CONTACT_PERMISSIONS)[keyof typeof CONTACT_PERMISSIONS]
  | (typeof TRUST_ACCOUNTS_PERMISSIONS)[keyof typeof TRUST_ACCOUNTS_PERMISSIONS]
  | (typeof ACTIVITY_PERMISSIONS)[keyof typeof ACTIVITY_PERMISSIONS]
  | (typeof NAV_PERMISSIONS)[keyof typeof NAV_PERMISSIONS]
  | (typeof IMPERSONATION_PERMISSIONS)[keyof typeof IMPERSONATION_PERMISSIONS];

/**
 * Roles in the system.
 */
export type Role =
  | 'Developer'
  | 'Admin'
  | 'Manager'
  | 'Auditor'
  | 'Staff'
  | 'Client';

/**
 * Permission schema mapping each role to its allowed permissions.
 * This is the single source of truth for RBAC in the system.
 */
export const permissionSchema: Record<Role, Permission[]> = {
  Developer: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    ...Object.values(DOCUMENT_PERMISSIONS),
    ...Object.values(PHONE_PERMISSIONS),
    ...Object.values(ACTIVITY_PERMISSIONS),
  ],
  Admin: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    ...Object.values(DOCUMENT_PERMISSIONS),
    ...Object.values(PHONE_PERMISSIONS),
    CLIENT_PERMISSIONS.VIEW,
    CLIENT_PERMISSIONS.VIEW_BILLING,
    CLIENT_PERMISSIONS.VIEW_STATUS,
    CLIENT_PERMISSIONS.EDIT,
    CONTACT_PERMISSIONS.EDIT,
    TRUST_ACCOUNTS_PERMISSIONS.EDIT,
    NAV_PERMISSIONS.TEAM_CLIENTS,
    CLIENT_PERMISSIONS.ARCHIVE,
    ACTIVITY_PERMISSIONS.ADD_STAFF_MEMBER_ACTIVITY,
    ACTIVITY_PERMISSIONS.ADD_BILLING_COMMENTARY,
    ACTIVITY_PERMISSIONS.ADD_EXTERNAL_FOLDER_INSTRUCTIONS,
    ACTIVITY_PERMISSIONS.ADD_SOFTWARE_ACCESS_INSTRUCTIONS,
    IMPERSONATION_PERMISSIONS.USE,
  ],
  Manager: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    CLIENT_PERMISSIONS.VIEW,
    CLIENT_PERMISSIONS.EDIT,
    NAV_PERMISSIONS.TEAM_CLIENTS,
    CONTACT_PERMISSIONS.EDIT,
    TRUST_ACCOUNTS_PERMISSIONS.EDIT,
    ACTIVITY_PERMISSIONS.ADD_EXTERNAL_FOLDER_INSTRUCTIONS,
    ACTIVITY_PERMISSIONS.ADD_SOFTWARE_ACCESS_INSTRUCTIONS,
  ],
  Auditor: [
    ...Object.values(AUDIT_PERMISSIONS),
    AUDIT_PERMISSIONS.GET_BY_CLIENT_ID,
    AUDIT_PERMISSIONS.GET_BY_ID,
    AUDIT_PERMISSIONS.EDIT,
    CLIENT_PERMISSIONS.VIEW,
    CONTACT_PERMISSIONS.EDIT,
    NAV_PERMISSIONS.TEAM_CLIENTS,
  ],
  Staff: [
    AUDIT_PERMISSIONS.GET_BY_CLIENT_ID,
    TASK_PERMISSIONS.GET_BY_AUDIT_ID,
    TASK_PERMISSIONS.GET_ASSIGNED_TO_ME,
    TASK_PERMISSIONS.GET_ALL,
    CLIENT_PERMISSIONS.VIEW,
    NAV_PERMISSIONS.TEAM_CLIENTS,
  ],
  Client: [
    DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID,
    DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID,
    DOCUMENT_PERMISSIONS.GET_BY_TASK_ID,
  ],
};

/**
 * Helper to get permissions for a given role.
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return permissionSchema[role] || [];
}

/**
 * Helper to check if a role has a specific permission.
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
} 