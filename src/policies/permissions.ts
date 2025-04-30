import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
  CLIENT_PERMISSIONS,
  ROLE_PERMISSION_PERMISSIONS,
  NAV_PERMISSIONS,
} from '@/constants/permissions';

/**
 * Permission type representing all possible permission strings.
 */
export type Permission =
  | (typeof AUDIT_PERMISSIONS)[keyof typeof AUDIT_PERMISSIONS]
  | (typeof TASK_PERMISSIONS)[keyof typeof TASK_PERMISSIONS]
  | (typeof DOCUMENT_PERMISSIONS)[keyof typeof DOCUMENT_PERMISSIONS]
  | (typeof PHONE_PERMISSIONS)[keyof typeof PHONE_PERMISSIONS]
  | (typeof CLIENT_PERMISSIONS)[keyof typeof CLIENT_PERMISSIONS]
  | (typeof ROLE_PERMISSION_PERMISSIONS)[keyof typeof ROLE_PERMISSION_PERMISSIONS]
  | (typeof NAV_PERMISSIONS)[keyof typeof NAV_PERMISSIONS];

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
  ],
  Admin: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    ...Object.values(DOCUMENT_PERMISSIONS),
    ...Object.values(PHONE_PERMISSIONS),
    CLIENT_PERMISSIONS.VIEW,
    CLIENT_PERMISSIONS.VIEW_BILLING,
    CLIENT_PERMISSIONS.VIEW_STATUS,
    ...Object.values(ROLE_PERMISSION_PERMISSIONS),
    NAV_PERMISSIONS.TEAM_DASHBOARD,
    NAV_PERMISSIONS.TEAM_CLIENTS,
  ],
  Manager: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    CLIENT_PERMISSIONS.VIEW,
    NAV_PERMISSIONS.TEAM_DASHBOARD,
    NAV_PERMISSIONS.TEAM_CLIENTS,
  ],
  Auditor: [
    AUDIT_PERMISSIONS.GET_BY_CLIENT_ID,
    AUDIT_PERMISSIONS.GET_BY_ID,
    CLIENT_PERMISSIONS.VIEW,
    NAV_PERMISSIONS.TEAM_DASHBOARD,
    NAV_PERMISSIONS.TEAM_CLIENTS,
  ],
  Staff: [
    TASK_PERMISSIONS.GET_BY_AUDIT_ID,
    TASK_PERMISSIONS.GET_ASSIGNED_TO_ME,
    TASK_PERMISSIONS.GET_ALL,
    CLIENT_PERMISSIONS.VIEW,
    NAV_PERMISSIONS.TEAM_DASHBOARD,
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