import { exampleRouter } from "@/server/api/routers/example";
import { userRouter } from "@/server/api/routers/user";
import { clientRouter } from "@/server/api/routers/client";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { contactRouter } from "@/server/api/routers/contact";
import { licenseRouter } from "@/server/api/routers/license";
import { trustAccountRouter } from "@/server/api/routers/trustAccount";
import { auditRouter } from "@/server/api/routers/audit";
import { taskRouter } from "@/server/api/routers/task";
import { documentRouter } from "@/server/api/routers/document";
import { emailRouter } from "@/server/api/routers/email";
import { sharepointRouter } from "@/server/api/routers/sharepoint";
import { chatRouter } from "@/server/api/routers/chat";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  clients: clientRouter,
  contact: contactRouter,
  license: licenseRouter,
  trustAccount: trustAccountRouter,
  audit: auditRouter,
  task: taskRouter,
  document: documentRouter,
  email: emailRouter,
  sharepoint: sharepointRouter,
  chat: chatRouter,
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
