import { z } from "zod";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { ROLE_PERMISSION_PERMISSIONS } from "@/constants/permissions";

// Input schemas for role-permission mapping operations
const assignSchema = z.object({
  roleId: z.number().int(),
  permissionId: z.number().int(),
});
const unassignSchema = z.object({
  roleId: z.number().int(),
  permissionId: z.number().int(),
});

// Router for Role-Permission mappings
export const rolePermissionRouter = createTRPCRouter({
  getAll: permissionProcedure(ROLE_PERMISSION_PERMISSIONS.GET_ALL)
    .query(async ({ ctx }) => {
      return ctx.db.rolePermission.findMany({
        include: { role: true, permission: true },
      });
    }),

  assign: permissionProcedure(ROLE_PERMISSION_PERMISSIONS.ASSIGN)
    .input(assignSchema)
    .mutation(async ({ ctx, input }) => {
      // Prevent duplicate mappings
      const existing = await ctx.db.rolePermission.findUnique({
        where: { roleId_permissionId: input },
      });
      if (existing) throw new Error("Mapping already exists");
      return ctx.db.rolePermission.create({
        data: {
          roleId: input.roleId,
          permissionId: input.permissionId,
        },
      });
    }),

  unassign: permissionProcedure(ROLE_PERMISSION_PERMISSIONS.UNASSIGN)
    .input(unassignSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rolePermission.delete({
        where: { roleId_permissionId: input },
      });
    }),
});