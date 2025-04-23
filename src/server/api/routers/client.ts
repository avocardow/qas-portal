import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  enforceRole,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Zod schemas for client operations
const clientGetAllSchema = z.object({
  take: z.number().min(1).max(100).optional(),
  cursor: z.string().uuid().optional(),
  filter: z.string().optional(),
  sortBy: z.enum(["clientName", "city", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
const clientByIdSchema = z.object({ clientId: z.string().uuid() });
const clientCreateSchema = z.object({
  clientName: z.string(),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  status: z.enum(["prospect", "active", "archived"]).optional(),
  auditMonthEnd: z.number().optional(),
  nextContactDate: z.date().optional(),
  estAnnFees: z.number().optional(),
});
const clientUpdateSchema = clientCreateSchema.extend({
  clientId: z.string().uuid(),
});

export const clientRouter = createTRPCRouter({
  getAll: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client"]))
    .input(clientGetAllSchema)
    .query(async ({ ctx, input }) => {
      const role = ctx.session.user.role ?? "";
      if (role === "Client") {
        // Clients only see their own client record
        const contact = await ctx.db.contact.findUnique({
          where: { portalUserId: ctx.session.user.id },
        });
        if (!contact) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No associated client",
          });
        }
        const client = await ctx.db.client.findUniqueOrThrow({
          where: { id: contact.clientId },
          select: { id: true, clientName: true, city: true, status: true },
        });
        return { items: [client], nextCursor: undefined };
      }
      if (!["Admin", "Manager"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      // Admin/Manager: full list with pagination
      const {
        take = 10,
        cursor,
        filter,
        sortBy = "clientName",
        sortOrder = "asc",
      } = input;
      const items = await ctx.db.client.findMany({
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: { clientName: { contains: filter || "" } },
        orderBy: { [sortBy]: sortOrder },
        select: { id: true, clientName: true, city: true, status: true },
      });
      const nextCursor =
        items.length === take ? items[take - 1]?.id : undefined;
      return { items, nextCursor };
    }),
  getById: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client"]))
    .input(clientByIdSchema)
    .query(async ({ ctx, input }) => {
      const role = ctx.session.user.role ?? "";
      if (role === "Client") {
        // Clients only see their own client
        const contact = await ctx.db.contact.findUnique({
          where: { portalUserId: ctx.session.user.id },
        });
        if (!contact || contact.clientId !== input.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return ctx.db.client.findUniqueOrThrow({
          where: { id: input.clientId },
          include: {
            contacts: true,
            licenses: true,
            trustAccounts: true,
            audits: true,
            activityLogs: true,
            notes: true,
          },
        });
      }
      if (!["Admin", "Manager"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      // Admin/Manager: full details
      return ctx.db.client.findUniqueOrThrow({
        where: { id: input.clientId },
        include: {
          contacts: true,
          licenses: true,
          trustAccounts: true,
          audits: true,
          activityLogs: true,
          notes: true,
        },
      });
    }),
  create: adminProcedure
    .input(clientCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.client.create({ data: input });
    }),
  update: adminProcedure
    .input(clientUpdateSchema)
    .mutation(({ ctx, input }) => {
      const { clientId, ...data } = input;
      return ctx.db.client.update({ where: { id: clientId }, data });
    }),
  deleteClient: adminProcedure
    .input(clientByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { clientId } = input;
      return ctx.db.client.delete({ where: { id: clientId } });
    }),
  // Procedure to update SharePoint folder ID for a client (Admins and Managers)
  updateSharepointFolderId: protectedProcedure
    .use(enforceRole(["Admin", "Manager"]))
    .input(
      z.object({
        clientId: z.string().uuid(),
        sharepointFolderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clientId, sharepointFolderId } = input;
      return ctx.db.client.update({
        where: { id: clientId },
        data: { sharepointFolderId },
      });
    }),
});
