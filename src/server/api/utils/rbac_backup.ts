import { TRPCError } from "@trpc/server";
import { rbacPolicy } from "@/utils/rbacPolicy";

/**
 * Checks if a role has a specific permission action.
 */
export function checkRolePermission(role: string, action: string): boolean {
  const permissions = (rbacPolicy as Record<string, string[]>)[role] || [];
  return permissions.includes(action);
}

/**
 * Throws a standardized FORBIDDEN TRPCError.
 */
export function throwForbiddenError(
  message = "Insufficient permissions"
): never {
  throw new TRPCError({ code: "FORBIDDEN", message });
}

/**
 * Logs an access control decision for auditing purposes.
 */
export function logAccessDecision(
  role: string,
  action: string,
  allowed: boolean
): void {
  const status = allowed ? "ALLOW" : "DENY";
  console.log(`[RBAC] ${status} ${role} -> ${action}`);
}

// Add helper functions for session user role and permission checks
export function hasRole(
  ctx: { session?: { user?: { role?: string } } },
  allowedRoles: string[]
): boolean {
  const role = ctx.session?.user?.role;
  return !!role && allowedRoles.includes(role);
}

export function hasPermission(
  ctx: { session?: { user?: { role?: string } } },
  permission: string
): boolean {
  const role = ctx.session?.user?.role;
  return !!role && checkRolePermission(role, permission);
}
