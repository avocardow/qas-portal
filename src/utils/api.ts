/**
 * This is the client-side entrypoint for your tRPC API.
 * It is generally recommended to create one new entrypoint for each type of procedure defined
 * in /src/server/api/trpc.ts
 * */
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";

export const api = createTRPCReact<AppRouter>();

// Export RouterOutput type for use in components
export type RouterOutput = inferRouterOutputs<AppRouter>;
