import { z } from "zod";
import { createTRPCRouter, adminOrManagerProcedure } from "@/server/api/trpc";

// Zod schemas for Contact operations
export const contactCreateSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  isPrimary: z.boolean().optional(),
  canLoginToPortal: z.boolean().optional(),
});

export const contactUpdateSchema = contactCreateSchema.extend({
  contactId: z.string().uuid(),
});

// CRUD procedures for Contact entity
export const contactRouter = createTRPCRouter({
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
});
