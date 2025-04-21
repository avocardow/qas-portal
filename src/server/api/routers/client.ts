import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const clientRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.client.findMany({
      select: {
        id: true,
        clientName: true,
        city: true,
        status: true,
      },
    });
  }),
  getById: publicProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.client.findUniqueOrThrow({
        where: { id: input.clientId },
        select: {
          id: true,
          clientName: true,
          abn: true,
          address: true,
          city: true,
          postcode: true,
          status: true,
          auditMonthEnd: true,
          nextContactDate: true,
          estAnnFees: true,
        },
      });
    }),
});
