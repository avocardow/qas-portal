import { z } from "zod";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";

// Zod schemas for audit operations
const auditCreateSchema = z.object({
  clientId: z.string().uuid(),
  auditYear: z.number().int(),
  stageId: z.number().int().optional(),
  statusId: z.number().int().optional(),
});

const updateStageStatusSchema = z.object({
  auditId: z.string().uuid(),
  stageId: z.number().int(),
  statusId: z.number().int(),
});

const getByClientIdSchema = z.object({ clientId: z.string().uuid() });
const getByIdSchema = z.object({ auditId: z.string().uuid() });
const assignUserSchema = z.object({
  auditId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().optional(),
});
const unassignUserSchema = z.object({
  auditId: z.string().uuid(),
  userId: z.string().uuid(),
});

// Router for audit management
export const auditRouter = createTRPCRouter({
  // Create a new audit
  create: permissionProcedure(AUDIT_PERMISSIONS.CREATE)
    .input(auditCreateSchema)
    .mutation(({ ctx, input }) => {
      const { clientId, auditYear, stageId, statusId } = input;
      return ctx.db.audit.create({
        data: { clientId, auditYear, stageId, statusId },
      });
    }),

  // Update stage and status of an existing audit
  updateStageStatus: permissionProcedure(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS)
    .input(updateStageStatusSchema)
    .mutation(({ ctx, input }) => {
      const { auditId, stageId, statusId } = input;
      return ctx.db.audit.update({
        where: { id: auditId },
        data: { stageId, statusId },
      });
    }),

  // Get all audits for a specific client
  getByClientId: permissionProcedure(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID)
    .input(getByClientIdSchema)
    .query(({ ctx, input }) => {
      return ctx.db.audit.findMany({
        where: { clientId: input.clientId },
        include: { stage: true, status: true },
      });
    }),

  // Get full audit details by audit ID
  getById: permissionProcedure(AUDIT_PERMISSIONS.GET_BY_ID)
    .input(getByIdSchema)
    .query(({ ctx, input }) => {
      return ctx.db.audit.findUnique({
        where: { id: input.auditId },
        include: {
          stage: true,
          status: true,
          assignments: true,
          tasks: true,
        },
      });
    }),

  // Assign a user to an audit
  assignUser: permissionProcedure(AUDIT_PERMISSIONS.ASSIGN_USER)
    .input(assignUserSchema)
    .mutation(({ ctx, input }) => {
      const { auditId, userId, role } = input;
      return ctx.db.auditAssignment.upsert({
        where: { auditId_userId: { auditId, userId } },
        update: { role },
        create: { auditId, userId, role },
      });
    }),

  // Unassign a user from an audit
  unassignUser: permissionProcedure(AUDIT_PERMISSIONS.UNASSIGN_USER)
    .input(unassignUserSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.auditAssignment.delete({
        where: {
          auditId_userId: { auditId: input.auditId, userId: input.userId },
        },
      });
    }),
});
