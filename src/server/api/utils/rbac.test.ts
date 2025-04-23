/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  createCallerFactory,
  permissionProcedure,
  protectedProcedure,
  enforceRole,
} from "@/server/api/trpc";
import { TASK_PERMISSIONS } from "@/constants/permissions";
import {
  checkRolePermission,
  throwForbiddenError,
  logAccessDecision,
  hasRole,
  hasPermission,
} from "./rbac";
import { createRBACTestContext } from "./rbacTestHelpers";

// Unit tests for RBAC utility functions
describe("RBAC Utilities", () => {
  test("checkRolePermission returns true when permission is allowed", () => {
    expect(checkRolePermission("Admin", TASK_PERMISSIONS.GET_ALL)).toBe(true);
  });

  test("checkRolePermission returns false when permission is not allowed", () => {
    expect(checkRolePermission("Client", TASK_PERMISSIONS.GET_ALL)).toBe(false);
  });

  test("throwForbiddenError throws a TRPCError with FORBIDDEN code", () => {
    expect.assertions(3);
    try {
      throwForbiddenError("Access denied");
    } catch (error: any) {
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toBe("Access denied");
    }
  });

  test("logAccessDecision logs correct ALLOW message", () => {
    const spy = vi.spyOn(console, "log");
    logAccessDecision("Manager", "ACTION", true);
    expect(spy).toHaveBeenCalledWith("[RBAC] ALLOW Manager -> ACTION");
    spy.mockRestore();
  });

  test("logAccessDecision logs correct DENY message", () => {
    const spy = vi.spyOn(console, "log");
    logAccessDecision("Staff", "TASK_UPDATE", false);
    expect(spy).toHaveBeenCalledWith("[RBAC] DENY Staff -> TASK_UPDATE");
    spy.mockRestore();
  });
});

// Unit tests for permissionProcedure middleware
describe("permissionProcedure", () => {
  const TEST_ACTION = "TEST_ACTION";
  const router = createTRPCRouter({
    test: permissionProcedure(TEST_ACTION).query(() => "OK"),
  });
  const call = createCallerFactory(router);

  test("allows access when hasPermission is true", async () => {
    const ctx = createRBACTestContext({ role: "Admin", hasPermission: true });
    const caller = call(ctx);
    await expect(caller.test()).resolves.toBe("OK");
  });

  test("denies access when hasPermission is false", async () => {
    const ctx = createRBACTestContext({ role: "Admin", hasPermission: false });
    const caller = call(ctx);
    await expect(caller.test()).rejects.toBeInstanceOf(TRPCError);
  });
});

// Unit tests for enforceRole middleware
describe("enforceRole middleware", () => {
  const ALLOWED = ["Admin"];
  const router = createTRPCRouter({
    test: protectedProcedure.use(enforceRole(ALLOWED)).query(() => "ALLOWED"),
  });
  const call = createCallerFactory(router);

  test("allows access when user role is in allowedRoles", async () => {
    const ctx = createRBACTestContext({ role: "Admin", hasPermission: true });
    const caller = call(ctx);
    await expect(caller.test()).resolves.toBe("ALLOWED");
  });

  test("denies access when user role is not in allowedRoles", async () => {
    const ctx = createRBACTestContext({ role: "Staff", hasPermission: true });
    const caller = call(ctx);
    await expect(caller.test()).rejects.toBeInstanceOf(TRPCError);
  });
});

// Unit tests for helper functions
describe("hasRole and hasPermission helpers", () => {
  const ctxAdmin = createRBACTestContext({ role: "Admin" });
  const ctxClient = createRBACTestContext({ role: "Client" });

  test("hasRole returns true when role is allowed", () => {
    expect(hasRole(ctxAdmin, ["Admin", "Manager"])).toBe(true);
  });

  test("hasRole returns false when role is not allowed", () => {
    expect(hasRole(ctxClient, ["Admin"])).toBe(false);
  });

  test("hasPermission returns true when permission is allowed", () => {
    expect(hasPermission(ctxAdmin, TASK_PERMISSIONS.GET_ALL)).toBe(true);
  });

  test("hasPermission returns false when permission is not allowed", () => {
    expect(hasPermission(ctxClient, TASK_PERMISSIONS.GET_ALL)).toBe(false);
  });
});
