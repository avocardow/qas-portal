import { exampleRouter } from "@/server/api/routers/example";
import { userRouter } from "@/server/api/routers/user";
import { clientRouter } from "@/server/api/routers/client";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  client: clientRouter,
  health: publicProcedure.query(() => ({ status: "ok" })),
  // Add other routers here
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const caller = createCaller(createContext());
 * const res = await caller.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
