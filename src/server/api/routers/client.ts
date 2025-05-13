import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  adminOrManagerProcedure,
  enforceRole,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ActivityLogType, Prisma } from "@prisma/client";

// Zod schemas for client operations
const clientGetAllSchema = z.object({
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).optional().default(15),
  filter: z.string().optional(),
  sortBy: z.enum([
    "clientName",        // Client Name column
    "nextContactDate",   // Next Contact Date column
    "auditPeriodEndDate",
    "estAnnFees",        // Fees column
    "status",            // Status column
    "auditStageName",    // Audit Stage (by stage.name)
    "city",              // City column
    "assignedUser",      // Assigned User column
  ]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  statusFilter: z.enum(["prospect", "active", "archived"]).optional(),
  showAll: z.boolean().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
});
const clientByIdSchema = z.object({ clientId: z.string().uuid() });
const clientCreateSchema = z.object({
  clientName: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  abn: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  internalFolder: z.string().url("Invalid URL").nullable().optional(),
  externalFolder: z.string().url("Invalid URL").nullable().optional(),
  xeroContactId: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditPeriodEndDate: z.date().nullable().optional(),
  nextContactDate: z.date().nullable().optional(),
  estAnnFees: z.number().nullable().optional(),
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
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditPeriodEndDate: z.date().nullable().optional(),
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
      createdBy: z.string().nullable().optional(),
      modifiedBy: z.string().nullable().optional(),
      creator: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
      modifier: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
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
  internalFolder: z.string().nullable().optional(),
  externalFolder: z.string().nullable().optional(),
  xeroContactId: z.string().nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
});

export const clientRouter = createTRPCRouter({
  getAll: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client", "Developer", "Auditor", "Staff"]))
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
      if (!["Admin", "Manager", "Developer", "Auditor", "Staff"].includes(role)) {
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
        assignedUserId,
      } = input;
      // If sorting by auditStageName, fallback to clientName for DB ordering
      const orderField = sortBy === "auditStageName" ? "clientName" : sortBy;

      // Determine which statuses to include
      const statuses = showAll ? undefined : [statusFilter ?? "active"];

      // Build where clause with status, assigned user filter, and search OR
      const whereClause: Prisma.ClientWhereInput = {};
      if (statuses) whereClause.status = { in: statuses };
      if (assignedUserId !== undefined) {
        if (assignedUserId === null) {
          // Filter clients with no audit assignments
          whereClause.audits = { every: { assignments: { none: {} } } };
        } else {
          // Filter clients assigned to the specified user in any audit
          whereClause.audits = {
            some: { assignments: { some: { userId: assignedUserId } } },
          };
        }
      }
      whereClause.OR = [
        { clientName: { contains: filter || "", mode: "insensitive" as const } },
        { contacts: { some: { name: { contains: filter || "", mode: "insensitive" as const } } } },
      ];

      // Calculate skip value for pagination
      const skip = (page - 1) * pageSize;

      // Use a transaction to get both count and paginated raw items
      const [totalCount, items] = await ctx.db.$transaction([
        ctx.db.client.count({ where: whereClause }),
        ctx.db.client.findMany({
          take: pageSize,
          skip: skip,
          where: whereClause,
          orderBy: sortBy === 'assignedUser'
            ? { assignedUser: { name: sortOrder } }
            : { [orderField]: sortOrder },
          select: {
            id: true,
            clientName: true,
            status: true,
            auditPeriodEndDate: true,
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
              select: {
                stage: { select: { name: true } },
                assignments: {
                  select: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
            assignedUser: { select: { id: true, name: true } },
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
    .use(enforceRole(["Admin", "Manager", "Client", "Developer", "Auditor", "Staff"]))
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
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                type: true,
                content: true,
                createdAt: true,
                createdBy: true,
                modifiedBy: true,
                creator: { select: { name: true } },
                modifier: { select: { name: true } },
              },
            },
            notes: true,
            documents: true,
          },
        });
        return {
          ...client,
          estAnnFees: client.estAnnFees != null && typeof client.estAnnFees === 'object' && 'toNumber' in client.estAnnFees ? client.estAnnFees.toNumber() : client.estAnnFees,
        };
      }
      if (!["Admin", "Manager", "Developer", "Auditor", "Staff"].includes(role)) {
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
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
              createdBy: true,
              modifiedBy: true,
              creator: { select: { name: true } },
              modifier: { select: { name: true } },
            },
          },
          notes: true,
          documents: true,
        },
      });
      return {
        ...client,
        estAnnFees: client.estAnnFees != null && typeof client.estAnnFees === 'object' && 'toNumber' in client.estAnnFees ? client.estAnnFees.toNumber() : client.estAnnFees,
      };
    }),
  create: adminOrManagerProcedure
    .input(clientCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.client.create({ data: input });
    }),
  update: protectedProcedure.use(enforceRole(["Admin", "Manager", "Auditor"]))
    .input(clientUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { clientId, ...data } = input;
      // Retrieve old client to detect assignment changes
      const oldClient = await ctx.db.client.findUnique({ where: { id: clientId }, select: { assignedUserId: true } });
      const updatedClient = await ctx.db.client.update({ where: { id: clientId }, data });
      // Log assignment activity if assignedUserId changed
      if (input.assignedUserId !== undefined && input.assignedUserId !== oldClient?.assignedUserId) {
        const user = await ctx.db.user.findUnique({ where: { id: input.assignedUserId as string }, select: { name: true } });
        await ctx.db.activityLog.create({
          data: {
            clientId,
            createdBy: ctx.session.user.id,
            type: ActivityLogType.client_assigned,
            content: `${user?.name} assigned to Client`,
          },
        });
      }
      return updatedClient;
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
        data: { internalFolder: internalFolderId },
      });
    }),
  addActivityLog: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Developer", "Auditor", "Staff"]))
    .input(
      z.object({
        clientId: z.string().uuid(),
        contactId: z.string().uuid().optional(),
        type: z.nativeEnum(ActivityLogType),
        content: z.string(),
        date: z.date().optional(),
        staffMemberId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clientId, contactId, type, content, date, staffMemberId } = input;
      return ctx.db.activityLog.create({
        data: {
          clientId,
          contactId,
          createdBy: staffMemberId ?? ctx.session.user.id,
          type,
          content,
          ...(date ? { createdAt: date } : {}),
        },
      });
    }),
  updateActivityLog: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Developer", "Auditor", "Staff"]))
    .input(
      z.object({
        id: z.string().uuid(),
        clientId: z.string().uuid(),
        type: z.nativeEnum(ActivityLogType),
        content: z.string(),
        date: z.date().optional(),
        contactId: z.string().uuid().nullable().optional(),
        staffMemberId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, type, content, date, contactId, staffMemberId } = input;
      const updateData: Prisma.ActivityLogUpdateInput = {
        type,
        content,
        modifier: { connect: { id: ctx.session.user.id } },
        ...(date ? { createdAt: date } : {}),
        ...(contactId !== undefined
          ? contactId === null
            ? { contact: { disconnect: true } }
            : { contact: { connect: { id: contactId } } }
          : {}),
        ...(staffMemberId ? { createdBy: staffMemberId } : {}),
      };
      const updated = await ctx.db.activityLog.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          createdBy: true,
          modifiedBy: true,
          creator: { select: { name: true } },
          modifier: { select: { name: true } },
          contactId: true,
        },
      });
      return updated;
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
