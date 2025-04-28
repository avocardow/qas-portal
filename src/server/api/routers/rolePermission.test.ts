/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { rolePermissionRouter } from "./rolePermission";

describe("rolePermissionRouter", () => {
  let ctx: any;
  let callRolePermission: any;
  const dummyMapping = { roleId: 1, permissionId: 2 };

  beforeEach(() => {
    ctx = {
      session: { user: { role: "Admin" } },
      db: {
        rolePermission: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          create: vi.fn(),
          delete: vi.fn(),
        },
        role: { findMany: vi.fn() },
        permission: { findMany: vi.fn() },
      },
    } as any;
    ctx.db.rolePermission.findFirst.mockResolvedValue({});
    callRolePermission = createCallerFactory(rolePermissionRouter);
  });

  describe("getAll", () => {
    it("should return all mappings", async () => {
      const mappings = [{ ...dummyMapping, role: {}, permission: {} }];
      ctx.db.rolePermission.findMany.mockResolvedValue(mappings);
      const caller = callRolePermission(ctx);
      const result = await caller.getAll();
      expect(ctx.db.rolePermission.findMany).toHaveBeenCalledWith({
        include: { role: true, permission: true },
      });
      expect(result).toEqual(mappings);
    });
  });

  describe("getRoles", () => {
    it("should return all roles", async () => {
      const roles = [{ id: 1, name: "Admin" }];
      ctx.db.role.findMany.mockResolvedValue(roles);
      const caller = callRolePermission(ctx);
      const result = await caller.getRoles();
      expect(ctx.db.role.findMany).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe("getPermissions", () => {
    it("should return all permissions", async () => {
      const permissions = [{ id: 2, action: "read" }];
      ctx.db.permission.findMany.mockResolvedValue(permissions);
      const caller = callRolePermission(ctx);
      const result = await caller.getPermissions();
      expect(ctx.db.permission.findMany).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe("assign", () => {
    it("should create mapping successfully when not existing", async () => {
      ctx.db.rolePermission.findUnique.mockResolvedValue(null);
      ctx.db.rolePermission.create.mockResolvedValue(dummyMapping);
      const caller = callRolePermission(ctx);
      const result = await caller.assign(dummyMapping);
      expect(ctx.db.rolePermission.findUnique).toHaveBeenCalledWith({
        where: { roleId_permissionId: dummyMapping },
      });
      expect(ctx.db.rolePermission.create).toHaveBeenCalledWith({
        data: dummyMapping,
      });
      expect(result).toEqual(dummyMapping);
    });

    it("should throw error when mapping already exists", async () => {
      ctx.db.rolePermission.findUnique.mockResolvedValue(dummyMapping);
      const caller = callRolePermission(ctx);
      await expect(caller.assign(dummyMapping)).rejects.toThrow("Mapping already exists");
    });
  });

  describe("unassign", () => {
    it("should delete mapping successfully", async () => {
      ctx.db.rolePermission.delete.mockResolvedValue(dummyMapping);
      const caller = callRolePermission(ctx);
      const result = await caller.unassign(dummyMapping);
      expect(ctx.db.rolePermission.delete).toHaveBeenCalledWith({
        where: { roleId_permissionId: dummyMapping },
      });
      expect(result).toEqual(dummyMapping);
    });
  });
});