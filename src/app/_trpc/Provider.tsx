"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink, createWSClient, wsLink, splitLink } from "@trpc/client";
import React, { useState } from "react";

import { api } from "@/utils/api";
import superjson from "superjson";
import { impersonationService } from '@/lib/impersonationService';

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const getWebSocketUrl = () => {
  if (typeof window === "undefined") return ""; // SSR - no WebSocket on server
  if (process.env.NODE_ENV === "production") {
    // In production, use secure WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `wss://${window.location.host}`;
    return wsUrl;
  }
  // Development - use local WebSocket server
  return "ws://localhost:3001";
};

export default function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 300000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => {
    // Create WebSocket client for subscriptions (client-side only)
    const wsClient = typeof window !== "undefined" ? createWSClient({
      url: getWebSocketUrl(),
      retryDelayMs: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }) : null;

    return api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        // Split link: WebSocket for subscriptions, HTTP for queries/mutations
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: wsClient ? wsLink({
            client: wsClient,
            transformer: superjson,
          }) : httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            headers: () => {
              const headers: Record<string, string> = {};
              const impRole = impersonationService.getImpersonatedRole();
              if (impRole) {
                headers['x-impersonate-role'] = impRole;
              }
              return headers;
            },
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            headers: () => {
              const headers: Record<string, string> = {};
              const impRole = impersonationService.getImpersonatedRole();
              if (impRole) {
                headers['x-impersonate-role'] = impRole;
              }
              return headers;
            },
          }),
        }),
      ],
    });
  });

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
