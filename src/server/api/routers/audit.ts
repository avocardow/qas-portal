import { z } from "zod";
import {
  createTRPCRouter,
  loggedProcedure,
  enforcePermission,
} from "@/server/api/trpc";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import { ActivityLogType } from "@prisma/client";

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
  // Create a new audit with logging and permission enforcement
  create: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.CREATE))
    .input(auditCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { clientId, auditYear, stageId, statusId } = input;
      const audit = await ctx.db.audit.create({
        data: { clientId, auditYear, stageId, statusId },
      });
      if (ctx.db.activityLog) {
        await ctx.db.activityLog.create({
          data: {
            auditId: audit.id,
            clientId: audit.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.note,
            content: `Created audit for year ${audit.auditYear}`,
          },
        });
      }
      return audit;
    }),

  // Update stage and status of an existing audit with logging
  updateStageStatus: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS))
    .input(updateStageStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { auditId, stageId, statusId } = input;
      const audit = await ctx.db.audit.update({
        where: { id: auditId },
        data: { stageId, statusId },
      });
      if (ctx.db.activityLog) {
        await ctx.db.activityLog.create({
          data: {
            auditId: audit.id,
            clientId: audit.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.stage_change,
            content: `Changed stage to ${stageId} and status to ${statusId}`,
          },
        });
      }
      return audit;
    }),

  // Update multiple audit fields (year, stage, status, dates)
  updateAudit: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS))
    .input(
      z.object({
        auditId: z.string().uuid(),
        auditYear: z.number().int().optional(),
        stageId: z.number().int().optional(),
        statusId: z.number().int().optional(),
        reportDueDate: z.date().optional(),
        lodgedWithOFTDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { auditId, auditYear, stageId, statusId, reportDueDate, lodgedWithOFTDate } = input;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};
      if (auditYear !== undefined) data.auditYear = auditYear;
      if (stageId !== undefined) data.stageId = stageId;
      if (statusId !== undefined) data.statusId = statusId;
      if (reportDueDate !== undefined) data.reportDueDate = reportDueDate;
      if (lodgedWithOFTDate !== undefined) data.lodgedWithOFTDate = lodgedWithOFTDate;
      const audit = await ctx.db.audit.update({ where: { id: auditId }, data });
      // No activityLog here; reuse existing logs if needed
      return audit;
    }),

  // Get all audits for a specific client with logging
  getByClientId: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
    .input(getByClientIdSchema)
    .query(async ({ ctx, input }) => {
      const audits = await ctx.db.audit.findMany({
        where: { clientId: input.clientId },
        include: { stage: true, status: true },
      });
      if (ctx.db.activityLog) {
        await ctx.db.activityLog.create({
          data: {
            clientId: input.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.note,
            content: `Viewed audits for client ${input.clientId}`,
          },
        });
      }
      return audits;
    }),

  // Get full audit details by audit ID with logging
  getById: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_ID))
    .input(getByIdSchema)
    .query(async ({ ctx, input }) => {
      const audit = await ctx.db.audit.findUnique({
        where: { id: input.auditId },
        include: {
          stage: true,
          status: true,
          assignments: { include: { user: true } },
          tasks: { include: { assignedUser: true } },
          activityLogs: {
            include: { creator: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (audit && ctx.db.activityLog) {
        await ctx.db.activityLog.create({
          data: {
            auditId: audit.id,
            clientId: audit.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.note,
            content: `Viewed audit details for ${input.auditId}`,
          },
        });
      }
      return audit;
    }),

  // Add endpoints to fetch audit stages and statuses
  getStages: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
    .input(z.void())
    .query(async ({ ctx }) => {
      const stages = await ctx.db.auditStage.findMany({
        orderBy: { id: "asc" },
      });
      return stages;
    }),

  getStatuses: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
    .input(z.void())
    .query(async ({ ctx }) => {
      const statuses = await ctx.db.auditStatus.findMany();
      return statuses;
    }),

  // Assign a user to an audit with logging
  assignUser: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.ASSIGN_USER))
    .input(assignUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { auditId, userId, role } = input;
      const assignment = await ctx.db.auditAssignment.upsert({
        where: { auditId_userId: { auditId, userId } },
        update: { role },
        create: { auditId, userId, role },
      });
      const audit = await ctx.db.audit.findUnique({ where: { id: auditId } });
      if (audit && ctx.db.activityLog) {
        // Fetch user name for log
        const user = await ctx.db.user.findUnique({ where: { id: userId }, select: { name: true } });
        await ctx.db.activityLog.create({
          data: {
            auditId,
            clientId: audit.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.audit_assigned,
            content: `${user?.name} assigned to Audit`,
          },
        });
      }
      return assignment;
    }),

  // Unassign a user from an audit with logging
  unassignUser: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.UNASSIGN_USER))
    .input(unassignUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { auditId, userId } = input;
      const removal = await ctx.db.auditAssignment.delete({
        where: { auditId_userId: { auditId, userId } },
      });
      const audit = await ctx.db.audit.findUnique({ where: { id: auditId } });
      if (audit && ctx.db.activityLog) {
        await ctx.db.activityLog.create({
          data: {
            auditId,
            clientId: audit.clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.note,
            content: `Unassigned user ${userId} from audit`,
          },
        });
      }
      return removal;
    }),

  // Get current/latest audit for a client
  getCurrent: loggedProcedure()
    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
    .input(getByClientIdSchema)
    .query(async ({ ctx, input }) => {
      const audit = await ctx.db.audit.findFirst({
        where: { clientId: input.clientId },
        orderBy: { auditYear: "desc" },
        include: { stage: true, status: true, assignments: { include: { user: true } } },
      });
      return audit;
    }),
});
