import { z } from "zod";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { DOCUMENT_PERMISSIONS } from "@/constants/permissions";

// Input schemas for document reference procedures
export const getByClientIdSchema = z.object({ clientId: z.string().uuid() });
export const getByAuditIdSchema = z.object({ auditId: z.string().uuid() });
export const getByTaskIdSchema = z.object({ taskId: z.string().uuid() });

// Output schema for document metadata
export const documentMetadataSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  sharepointFileUrl: z.string().nullable(),
});
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

// Placeholder for documentRouter; procedures to be implemented in subsequent subtasks
export const documentRouter = createTRPCRouter({
  getByClientId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID)
    .input(getByClientIdSchema)
    .query(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;
      // Base query filter
      const where: Prisma.DocumentReferenceWhereInput = {
        clientId: input.clientId,
      };
      // If the user is a client, restrict to their client documents and only shared ones
      if (userRole === "Client") {
        const contact = await ctx.db.contact.findUnique({
          where: { portalUserId: userId },
        });
        if (!contact || contact.clientId !== input.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        where.isSharedWithClient = true;
      }
      const docs = await ctx.db.documentReference.findMany({
        where,
        select: { id: true, fileName: true, sharepointFileUrl: true },
        orderBy: { createdAt: "desc" },
      });
      return docs;
    }),
  getByAuditId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID)
    .input(getByAuditIdSchema)
    .query(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;
      // Load audit to get clientId
      const audit = await ctx.db.audit.findUnique({
        where: { id: input.auditId },
      });
      if (!audit) throw new TRPCError({ code: "NOT_FOUND" });
      const where: Prisma.DocumentReferenceWhereInput = {
        auditId: input.auditId,
      };
      if (userRole === "Client") {
        // Ensure the client owns this audit
        const contact = await ctx.db.contact.findUnique({
          where: { portalUserId: userId },
        });
        if (!contact || contact.clientId !== audit.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        where.isSharedWithClient = true;
      }
      const docs = await ctx.db.documentReference.findMany({
        where,
        select: { id: true, fileName: true, sharepointFileUrl: true },
        orderBy: { createdAt: "desc" },
      });
      return docs;
    }),
  getByTaskId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_TASK_ID)
    .input(getByTaskIdSchema)
    .query(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;
      // Load task to get auditId
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
      });
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      const where: Prisma.DocumentReferenceWhereInput = {
        taskId: input.taskId,
      };
      if (userRole === "Client") {
        // Ensure the client owns the parent audit
        const audit = await ctx.db.audit.findUnique({
          where: { id: task.auditId },
        });
        if (!audit) throw new TRPCError({ code: "NOT_FOUND" });
        const contact = await ctx.db.contact.findUnique({
          where: { portalUserId: userId },
        });
        if (!contact || contact.clientId !== audit.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        where.isSharedWithClient = true;
      }
      const docs = await ctx.db.documentReference.findMany({
        where,
        select: { id: true, fileName: true, sharepointFileUrl: true },
        orderBy: { createdAt: "desc" },
      });
      return docs;
    }),
});
