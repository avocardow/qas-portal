import { z } from "zod";
import { createTRPCRouter, protectedProcedure, enforceRole } from "@/server/api/trpc";

export const activityLogRouter = createTRPCRouter({
  getByClient: protectedProcedure
    .use(enforceRole(["Admin", "Manager", "Developer", "Client"]))
    .input(
      z.object({
        clientId: z.string().uuid(),
        limit: z.number().min(1).max(100).optional().default(20),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clientId, limit, cursor } = input;
      const logs = await ctx.db.activityLog.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        skip: cursor ? 1 : 0,
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          createdBy: true,
        },
      });
      let nextCursor: string | undefined = undefined;
      if (logs.length > limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }
      return { items: logs, nextCursor };
    }),
}); 