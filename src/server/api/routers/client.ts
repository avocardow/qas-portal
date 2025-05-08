import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  enforceRole,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ActivityLogType } from "@prisma/client";

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

// Add explicit Zod schema for getById response to ensure correct output types
const clientByIdResponseSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  abn: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditMonthEnd: z.number().nullable().optional(),
  nextContactDate: z.date().nullable().optional(),
  estAnnFees: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  contacts: z.array(
    z.object({
      id: z.string(),
      name: z.string().nullable().optional(),
      isPrimary: z.boolean(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      canLoginToPortal: z.boolean().optional(),
      portalUserId: z.string().nullable().optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
      clientId: z.string().optional(),
    })
  ),
  licenses: z.array(z.any()).optional(),
  trustAccounts: z.array(z.any()).optional(),
  audits: z.array(z.any()).optional(),
  activityLogs: z.array(
    z.object({
      id: z.string(),
      type: z.nativeEnum(ActivityLogType),
      content: z.string(),
      createdAt: z.date(),
    })
  ).optional(),
  notes: z.array(z.any()).optional(),
  assignedUser: z.any().optional(),
  documents: z.array(
    z.object({
      id: z.string(),
      fileName: z.string(),
      sharepointFileUrl: z.string().nullable(),
    })
  ).optional(),
  internalFolderId: z.string().nullable().optional(),
  externalFolderId: z.string().nullable().optional(),
  xeroContactId: z.string().nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
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
            contacts: {
              select: {
                id: true,
                name: true,
                isPrimary: true,
                phone: true,
                email: true,
                title: true,
                canLoginToPortal: true,
                portalUserId: true,
                createdAt: true,
                updatedAt: true,
                clientId: true,
              },
            },
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
        estAnnFees: item.estAnnFees != null && typeof item.estAnnFees === 'object' && 'toNumber' in item.estAnnFees ? item.estAnnFees.toNumber() : item.estAnnFees,
        auditStageName: item.audits?.[0]?.stage?.name ?? null,
      }));
      return { items: resultItems, totalCount };
    }),
  getById: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client", "Developer"]))
    .input(clientByIdSchema)
    .output(clientByIdResponseSchema)
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
        const client = await ctx.db.client.findUniqueOrThrow({
          where: { id: input.clientId },
          include: {
            assignedUser: true,
            contacts: {
              select: {
                id: true,
                name: true,
                isPrimary: true,
                phone: true,
                email: true,
                title: true,
                canLoginToPortal: true,
                portalUserId: true,
                createdAt: true,
                updatedAt: true,
                clientId: true,
              },
            },
            licenses: true,
            trustAccounts: true,
            audits: true,
            activityLogs: { orderBy: { createdAt: 'desc' } },
            notes: true,
            documents: true,
          },
        });
        return {
          ...client,
          estAnnFees: client.estAnnFees != null && typeof client.estAnnFees === 'object' && 'toNumber' in client.estAnnFees ? client.estAnnFees.toNumber() : client.estAnnFees,
        };
      }
      if (!["Admin", "Manager", "Developer"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      // Admin/Manager: full details
      const client = await ctx.db.client.findUniqueOrThrow({
        where: { id: input.clientId },
        include: {
          assignedUser: true,
          contacts: {
            select: {
              id: true,
              name: true,
              isPrimary: true,
              phone: true,
              email: true,
              title: true,
              canLoginToPortal: true,
              portalUserId: true,
              createdAt: true,
              updatedAt: true,
              clientId: true,
            },
          },
          licenses: true,
          trustAccounts: true,
          audits: true,
          activityLogs: { orderBy: { createdAt: 'desc' } },
          notes: true,
          documents: true,
        },
      });
      return {
        ...client,
        estAnnFees: client.estAnnFees != null && typeof client.estAnnFees === 'object' && 'toNumber' in client.estAnnFees ? client.estAnnFees.toNumber() : client.estAnnFees,
      };
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
  archive: protectedProcedure
    .use(enforceRole(["Admin", "Manager"]))
    .input(z.object({ clientId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { clientId } = input;
      return ctx.db.client.update({ where: { id: clientId }, data: { status: "archived" } });
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
  addActivityLog: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Developer"]))
    .input(
      z.object({
        clientId: z.string().uuid(),
        contactId: z.string().uuid().optional(),
        type: z.nativeEnum(ActivityLogType),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clientId, contactId, type, content } = input;
      return ctx.db.activityLog.create({
        data: { clientId, contactId, userId: ctx.session.user.id, type, content },
      });
    }),
  // Aggregate and prepare data for client lifetime value projection
  getLifetimeData: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Developer", "Client"]))
    .input(z.object({ clientId: z.string().uuid() }))
    .output(
      z.object({
        totalFees: z.number(),
        feeHistory: z.array(z.object({ date: z.string(), value: z.number() })),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch client estimated annual fees
      const client = await ctx.db.client.findUniqueOrThrow({
        where: { id: input.clientId },
        select: { estAnnFees: true },
      });
      const totalFees =
        client.estAnnFees != null && typeof client.estAnnFees === 'object' && 'toNumber' in client.estAnnFees
          ? client.estAnnFees.toNumber()
          : client.estAnnFees ?? 0;
      // Gather all document references (e.g., invoices) for this client as event points
      const docs = await ctx.db.documentReference.findMany({
        where: { clientId: input.clientId },
        select: { createdAt: true },
      });
      // Prepare fee history points (using event dates and totalFees as placeholder value)
      const feeHistory = docs
        .map((doc) => ({
          date: doc.createdAt.toISOString().split('T')[0],
          value: totalFees,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { totalFees, feeHistory };
    }),
});
