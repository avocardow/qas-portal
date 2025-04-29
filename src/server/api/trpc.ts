/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth"; // We'll create this file next
import {
  throwForbiddenError,
  logAccessDecision,
} from "@/server/api/utils/rbac";
import { roleHasPermission as hasPermission, type Role as PolicyRole, type Permission } from "@/policies/permissions";
import { logger } from "@/server/api/utils/logger";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients
 * support setting type-safe context values from the request.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your API.
 *
 * - publicProcedure: is a procedure that doesn't require the user to be authenticated.
 * - protectedProcedure: is a procedure that requires the user to be authenticated.
 *
 * @see https://trpc.io/docs/router
 * @see https://trpc.io/docs/procedures
 */

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Alias for authentication middleware
export const isAuthed = enforceUserIsAuthed;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(isAuthed);

// Add RBAC middleware to enforce specific roles
export const enforceRole = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    const userRole = ctx.session?.user?.role;
    // 🚀 Developers bypass all role checks
    if (userRole === "Developer") {
      logAccessDecision(userRole, `ROLE:${allowedRoles.join(",")}`, true);
      return next({ ctx: { session: ctx.session! } });
    }
    const allowed = Boolean(userRole && allowedRoles.includes(userRole));
    logAccessDecision(
      userRole ?? "",
      `ROLE:${allowedRoles.join(",")}`,
      allowed
    );
    if (!allowed) {
      throwForbiddenError("Access denied");
    }
    return next({
      ctx: { session: ctx.session! },
    });
  });

// Procedures for common role checks
export const adminProcedure = protectedProcedure.use(enforceRole(["Admin"]));
export const managerProcedure = protectedProcedure.use(
  enforceRole(["Manager"])
);
export const adminOrManagerProcedure = protectedProcedure.use(
  enforceRole(["Admin", "Manager"])
);

// Generic permission enforcement middleware for RBAC actions
export const enforcePermission = (permission: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      logger.warn("Unauthorized access attempt", { permission });
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not authenticated" });
    }
    const role = ctx.session.user.role;
    if (!role) {
      logger.warn("Permission denied: no role", { userId: ctx.session?.user?.id, permission });
      logAccessDecision("", permission, false);
      throwForbiddenError(`Insufficient permissions for action '${permission}'`);
    }
    // 🚀 Developers bypass all permission checks
    if (role === "Developer") {
      logAccessDecision(role, permission, true);
      return next({ ctx: { session: ctx.session } });
    }
    // Static policy engine check
    const staticAllowed = hasPermission(role as PolicyRole, permission as Permission);
    if (staticAllowed) {
      logAccessDecision(role, permission, true);
      return next({ ctx: { session: ctx.session } });
    }
    // Fallback dynamic permission lookup in DB
    const permissionRecord = await ctx.db.rolePermission.findFirst({
      where: { role: { name: role }, permission: { action: permission } },
    });
    const dynamicAllowed = Boolean(permissionRecord);
    logAccessDecision(role, permission, dynamicAllowed);
    if (!dynamicAllowed) {
      logger.warn("Permission denied", { userId: ctx.session.user.id, role, permission });
      throwForbiddenError(`Insufficient permissions for action '${permission}'`);
    }
    return next({ ctx: { session: ctx.session } });
  });

// Procedure builder to require a specific permission
export const permissionProcedure = (permission: string) =>
  protectedProcedure.use(enforcePermission(permission));

// Generic logging middleware for tRPC procedures
export const logMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  // Replace this with your monitoring/logging integration
  console.log(
    `[tRPC] ${type.toUpperCase()} ${path} called by user ${ctx.session?.user?.id ?? "anonymous"}`
  );
  return next();
});

// Helper to create procedures that include logging
export const loggedProcedure = () => t.procedure.use(logMiddleware);
