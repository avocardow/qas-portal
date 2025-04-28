import { 
  getPermissionsForRole,
  roleHasPermission,
  Role as PolicyRole,
  Permission,
} from "@/policies/permissions";
import { canAccess as canAccessServer } from "@/utils/rbacPolicy";

/**
 * Check if a given role has a specific permission. Developer bypasses all checks.
 * @param role - Role of the user (PolicyRole or null)
 * @param permission - Permission string to check
 * @returns boolean indicating if the role has the permission
 */
export function hasPermission(
  role: PolicyRole | null,
  permission: Permission | string
): boolean {
  if (!role) return false;
  if (role === "Developer") return true;
  return roleHasPermission(role, permission as Permission);
}

/**
 * Server-side permission check utility. Developer bypasses all checks.
 * @param permission - Permission string to check
 * @param role - Role of the user (PolicyRole or null)
 */
export function canAccessPermission(
  role: PolicyRole | null,
  permission: string
): boolean {
  return canAccessServer(permission, role);
}

/**
 * List all permissions for a given role.
 * @param role - Role of the user (PolicyRole or null)
 * @returns array of permission strings
 */
export function listPermissions(
  role: PolicyRole | null
): (Permission | string)[] {
  if (!role) return [];
  return getPermissionsForRole(role as PolicyRole);
} 