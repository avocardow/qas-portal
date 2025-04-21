/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { auditRouter } from "./audit";
import { TRPCError } from "@trpc/server";

// Unit tests to validate RBAC enforcement on auditRouter endpoints

// Use valid UUIDs for testing
const validClientId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const validAuditId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const validUserId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

describe("Audit RBAC Enforcement", () => {
  let ctx: any;
  let callAudit: any;

  beforeEach(() => {
    // Mock Prisma client for DB interactions
    const db = {
      rolePermission: { findFirst: vi.fn() },
      audit: {
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      auditAssignment: {
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    } as any;
    // Default to Admin role
    ctx = {
      session: { user: { id: validUserId, role: "Admin" } },
      db,
      headers: new Headers(),
    };
    callAudit = createCallerFactory(auditRouter);
  });

  test("Admin can create an audit", async () => {
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    ctx.db.audit.create.mockResolvedValue({
      id: validAuditId,
      clientId: validClientId,
      auditYear: 2025,
    });
    const caller = callAudit(ctx);
    const result = await caller.create({
      clientId: validClientId,
      auditYear: 2025,
    });
    expect(result).toEqual({
      id: validAuditId,
      clientId: validClientId,
      auditYear: 2025,
    });
  });

  test("Staff cannot create an audit", async () => {
    ctx.session.user.role = "Staff";
    ctx.db.rolePermission.findFirst.mockResolvedValue(null);
    const caller = callAudit(ctx);
    await expect(
      caller.create({ clientId: validClientId, auditYear: 2025 })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  test("Auditor can view audits for a client", async () => {
    ctx.session.user.role = "Auditor";
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    ctx.db.audit.findMany.mockResolvedValue([
      { id: validAuditId, clientId: validClientId, auditYear: 2025 },
    ]);
    const caller = callAudit(ctx);
    const result = await caller.getByClientId({ clientId: validClientId });
    expect(result).toEqual([
      { id: validAuditId, clientId: validClientId, auditYear: 2025 },
    ]);
  });

  test("User without permission cannot unassign a user", async () => {
    ctx.session.user.role = "Client";
    ctx.db.rolePermission.findFirst.mockResolvedValue(null);
    const caller = callAudit(ctx);
    await expect(
      caller.unassignUser({ auditId: validAuditId, userId: validUserId })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
