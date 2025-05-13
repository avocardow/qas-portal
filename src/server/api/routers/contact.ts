import { z } from "zod";
import {
  createTRPCRouter,
  adminOrManagerProcedure,
  protectedProcedure,
  enforceRole,
} from "@/server/api/trpc";

// Zod schemas for Contact operations
export const contactCreateSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().nullable().optional(),
  isPrimary: z.boolean().optional(),
  canLoginToPortal: z.boolean().optional(),
});

export const contactUpdateSchema = contactCreateSchema.extend({
  contactId: z.string().uuid(),
});

// Additional schemas for listing and querying
export const contactGetAllSchema = z.object({
  take: z.number().min(1).max(100).optional(),
  cursor: z.string().uuid().optional(),
  filter: z.string().optional(),
  sortBy: z.enum(["name", "city", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const contactByIdSchema = z.object({ contactId: z.string().uuid() });

// Zod schemas for batch operations
const contactBatchCreateSchema = z.array(contactCreateSchema);
const contactBatchUpdateSchema = z.array(contactUpdateSchema);

// CRUD and batch procedures for Contact entity
export const contactRouter = createTRPCRouter({
  // List contacts with pagination and optional filtering
  getAll: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client"]))
    .input(contactGetAllSchema)
    .query(async ({ ctx, input }) => {
      const { take = 10, cursor, filter, sortBy = "name", sortOrder = "asc" } = input;
      const items = await ctx.db.contact.findMany({
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: { name: { contains: filter || "" } },
        orderBy: { [sortBy]: sortOrder },
      });
      const nextCursor =
        items.length === take ? items[take - 1]?.id : undefined;
      return { items, nextCursor };
    }),
  // Get a single contact by ID
  getById: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Client"]))
    .input(contactByIdSchema)
    .query(({ ctx, input }) => {
      return ctx.db.contact.findUniqueOrThrow({
        where: { id: input.contactId },
      });
    }),
  // Delete a contact
  deleteContact: adminOrManagerProcedure
    .input(contactByIdSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.delete({ where: { id: input.contactId } });
    }),
  create: adminOrManagerProcedure
    .input(contactCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.create({ data: input });
    }),
  update: adminOrManagerProcedure
    .input(contactUpdateSchema)
    .mutation(({ ctx, input }) => {
      const { contactId, ...data } = input;
      return ctx.db.contact.update({ where: { id: contactId }, data });
    }),
  batchCreate: adminOrManagerProcedure
    .input(contactBatchCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.createMany({ data: input, skipDuplicates: true });
    }),
  batchUpdate: adminOrManagerProcedure
    .input(contactBatchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ contactId, ...data }) =>
        ctx.db.contact.update({ where: { id: contactId }, data })
      );
      return ctx.db.$transaction(updates);
    }),
});
