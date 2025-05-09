import { z } from "zod";
import { createTRPCRouter, adminOrManagerProcedure } from "@/server/api/trpc";

// Zod schemas for TrustAccount operations
export const trustAccountCreateSchema = z.object({
  clientId: z.string().uuid(),
  accountName: z.string().optional(),
  bankName: z.string(),
  bsb: z.string().optional(),
  accountNumber: z.string().optional(),
  primaryLicenseId: z.string().uuid().optional(),
  hasSoftwareAccess: z.boolean().optional(),
  managementSoftware: z.string().optional(),
  softwareUrl: z.string().url().optional(),
});

export const trustAccountUpdateSchema = trustAccountCreateSchema.extend({
  trustAccountId: z.string().uuid(),
});

// Zod schemas for batch operations
const trustAccountBatchCreateSchema = z.array(trustAccountCreateSchema);
const trustAccountBatchUpdateSchema = z.array(trustAccountUpdateSchema);

// Router stub for TrustAccount (to be implemented in later subtasks)
export const trustAccountRouter = createTRPCRouter({
  create: adminOrManagerProcedure
    .input(trustAccountCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.trustAccount.create({ data: input });
    }),
  update: adminOrManagerProcedure
    .input(trustAccountUpdateSchema)
    .mutation(({ ctx, input }) => {
      const { trustAccountId, ...data } = input;
      return ctx.db.trustAccount.update({
        where: { id: trustAccountId },
        data,
      });
    }),
  batchCreate: adminOrManagerProcedure
    .input(trustAccountBatchCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.trustAccount.createMany({
        data: input,
        skipDuplicates: true,
      });
    }),
  batchUpdate: adminOrManagerProcedure
    .input(trustAccountBatchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ trustAccountId, ...data }) =>
        ctx.db.trustAccount.update({ where: { id: trustAccountId }, data })
      );
      return ctx.db.$transaction(updates);
    }),
  delete: adminOrManagerProcedure
    .input(z.object({ trustAccountId: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.trustAccount.delete({ where: { id: input.trustAccountId } });
    }),
});
