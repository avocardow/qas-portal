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
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).optional().default(10),
  filter: z.string().optional(),
  sortBy: z.enum([
    "clientName",        // Client Name column
    "nextContactDate",   // Next Contact Date column
    "auditMonthEnd",     // Audit Month End column
    "estAnnFees",        // Fees column
    "status",            // Status column
    "auditStageName",    // Audit Stage (by stage.name)
    "city",              // City column
  ]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  statusFilter: z.enum(["prospect", "active", "archived"]).optional(),
  showAll: z.boolean().optional(),
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
    .use(enforceRole(["Admin", "Manager", "Client", "Developer"]))
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
      if (!["Admin", "Manager", "Developer"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      // Admin/Manager: full list with pagination
      const {
        page,
        pageSize,
        filter,
        sortBy = "clientName",
        sortOrder = "asc",
        statusFilter,
        showAll = false,
      } = input;
      // If sorting by auditStageName, fallback to clientName for DB ordering
      const orderField = sortBy === "auditStageName" ? "clientName" : sortBy;

      // Determine which statuses to include
      const statuses = showAll ? undefined : [statusFilter ?? "active"];

      // Define the base where clause for filtering
      const whereClause = {
        ...(statuses ? { status: { in: statuses } } : {}),
        OR: [
          {
            clientName: {
              contains: filter || "",
              mode: "insensitive" as const,
            },
          },
          {
            contacts: {
              some: {
                name: { contains: filter || "", mode: "insensitive" as const },
              },
            },
          },
        ],
      };

      // Calculate skip value for pagination
      const skip = (page - 1) * pageSize;

      // Use a transaction to get both count and paginated raw items
      const [totalCount, items] = await ctx.db.$transaction([
        ctx.db.client.count({ where: whereClause }),
        ctx.db.client.findMany({
          take: pageSize,
          skip: skip,
          where: whereClause,
          orderBy: { [orderField]: sortOrder },
          select: {
            id: true,
            clientName: true,
            status: true,
            auditMonthEnd: true,
            nextContactDate: true,
            estAnnFees: true,
            contacts: { select: { name: true, isPrimary: true } },
            audits: {
              take: 1,
              orderBy: { auditYear: "desc" },
              select: { stage: { select: { name: true } } },
            },
          },
        }),
      ]);
      // Map audit stage name onto items for client-side sorting
      const resultItems = items.map((item) => ({
        ...item,
        auditStageName: item.audits?.[0]?.stage?.name ?? null,
      }));
      return { items: resultItems, totalCount };
    }),
  getById: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client", "Developer"]))
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
            documents: true,
          },
        });
      }
      if (!["Admin", "Manager", "Developer"].includes(role)) {
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
          documents: true,
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
        internalFolderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clientId, internalFolderId } = input;
      return ctx.db.client.update({
        where: { id: clientId },
        data: { internalFolderId },
      });
    }),
});
