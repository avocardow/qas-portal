import { z } from "zod";
import { createTRPCRouter, adminOrManagerProcedure } from "@/server/api/trpc";

// Zod schemas for License operations
export const licenseCreateSchema = z.object({
  holderType: z.enum(["client", "contact"]),
  clientId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  licenseNumber: z.string(),
  licenseType: z.string().optional(),
  renewalMonth: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

export const licenseUpdateSchema = licenseCreateSchema.extend({
  licenseId: z.string().uuid(),
});

// Zod schemas for batch operations
const licenseBatchCreateSchema = z.array(licenseCreateSchema);
const licenseBatchUpdateSchema = z.array(licenseUpdateSchema);

// Router stub for License (to be implemented in later subtasks)
export const licenseRouter = createTRPCRouter({
  create: adminOrManagerProcedure
    .input(licenseCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.license.create({ data: input });
    }),
  update: adminOrManagerProcedure
    .input(licenseUpdateSchema)
    .mutation(({ ctx, input }) => {
      const { licenseId, ...data } = input;
      return ctx.db.license.update({ where: { id: licenseId }, data });
    }),
  batchCreate: adminOrManagerProcedure
    .input(licenseBatchCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.license.createMany({ data: input, skipDuplicates: true });
    }),
  batchUpdate: adminOrManagerProcedure
    .input(licenseBatchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ licenseId, ...data }) =>
        ctx.db.license.update({ where: { id: licenseId }, data })
      );
      return ctx.db.$transaction(updates);
    }),
  // Fetch all licenses for a given contact
  getByContactId: adminOrManagerProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.license.findMany({ where: { contactId: input.contactId } });
    }),
  // Fetch a single license by its licenseNumber
  getByLicenseNumber: adminOrManagerProcedure
    .input(z.object({ licenseNumber: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.license.findUnique({ where: { licenseNumber: input.licenseNumber } });
    }),
});
