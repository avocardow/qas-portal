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
});
