import { z } from "zod";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TASK_PERMISSIONS } from "@/constants/permissions";

// Input schemas for task procedures
const getByAuditIdSchema = z.object({ auditId: z.string().uuid() });
const getAssignedToMeSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional(),
});
const getAllTasksSchema = getAssignedToMeSchema.extend({
  auditId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
});
const createTaskSchema = z.object({
  auditId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  assignedUserId: z.string().uuid().optional(),
  dueDate: z.date().optional(),
  priority: z.string().optional(),
  requiresClientAction: z.boolean().optional(),
});
const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().uuid(),
  status: z.string().optional(),
});
const deleteTaskSchema = z.object({ taskId: z.string().uuid() });

// Router for Task operations
export const taskRouter = createTRPCRouter({
  getByAuditId: permissionProcedure(TASK_PERMISSIONS.GET_BY_AUDIT_ID)
    .input(getByAuditIdSchema)
    .query(async ({ ctx, input }) => {
      // Retrieve tasks for a specific audit, sorted by creation date descending
      return ctx.db.task.findMany({
        where: { auditId: input.auditId },
        orderBy: { createdAt: "desc" },
      });
    }),
  getAssignedToMe: permissionProcedure(TASK_PERMISSIONS.GET_ASSIGNED_TO_ME)
    .input(getAssignedToMeSchema)
    .query(async ({ ctx, input }) => {
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 10;
      const where: Prisma.TaskWhereInput = {
        assignedUserId: ctx.session.user.id,
      };
      if (input.status) {
        where.status = input.status;
      }
      // Fetch tasks assigned to the current user with pagination, sorting
      return ctx.db.task.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [input.sortBy ?? "createdAt"]: input.sortOrder ?? "desc",
        },
      });
    }),
  getAll: permissionProcedure(TASK_PERMISSIONS.GET_ALL)
    .input(getAllTasksSchema)
    .query(async ({ ctx, input }) => {
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 10;
      const where: Prisma.TaskWhereInput = {};
      if (input.auditId) {
        where.auditId = input.auditId;
      }
      if (input.assignedUserId) {
        where.assignedUserId = input.assignedUserId;
      }
      if (input.status) {
        where.status = input.status;
      }
      const sortBy = input.sortBy ?? "createdAt";
      const sortOrder = input.sortOrder ?? "desc";
      return ctx.db.task.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      });
    }),
  create: permissionProcedure(TASK_PERMISSIONS.CREATE)
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      // Create a new task under specified audit
      const task = await ctx.db.task.create({
        data: {
          auditId: input.auditId,
          name: input.name,
          description: input.description,
          assignedUserId: input.assignedUserId,
          dueDate: input.dueDate,
          priority: input.priority,
          requiresClientAction: input.requiresClientAction,
        },
      });
      return task;
    }),
  update: permissionProcedure(TASK_PERMISSIONS.UPDATE)
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      // Update existing task fields
      const { taskId, ...data } = input;
      const updated = await ctx.db.task.update({
        where: { id: taskId },
        data,
      });
      return updated;
    }),
  delete: permissionProcedure(TASK_PERMISSIONS.DELETE)
    .input(deleteTaskSchema)
    .mutation(async ({ ctx, input }) => {
      // Delete the specified task
      const deleted = await ctx.db.task.delete({
        where: { id: input.taskId },
      });
      return deleted;
    }),
  getById: permissionProcedure(TASK_PERMISSIONS.GET_ALL)
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({ where: { id: input.taskId } });
    }),
});
