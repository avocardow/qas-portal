import { TRPCError } from "@trpc/server";

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