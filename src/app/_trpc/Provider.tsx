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
    // Create WebSocket client for subscriptions with enhanced exponential backoff
    const wsClient = typeof window !== "undefined" ? createWSClient({
      url: getWebSocketUrl(),
             // Enhanced exponential backoff with jitter and max attempts
       retryDelayMs: (attemptIndex) => {
         // Cap at 10 attempts with very long delay for final attempts
         if (attemptIndex >= 10) {
           console.warn('WebSocket max retry attempts reached, using maximum delay');
           return 60000; // 1 minute delay for final attempts
         }
         
         // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (cap at 30s)
         const baseDelay = 1000 * Math.pow(2, attemptIndex);
         const maxDelay = 30000; // 30 seconds max
         const cappedDelay = Math.min(baseDelay, maxDelay);
         
         // Add jitter (±20%) to prevent thundering herd
         const jitter = cappedDelay * 0.2 * (Math.random() - 0.5);
         const finalDelay = Math.max(500, cappedDelay + jitter);
         
         console.log(`WebSocket retry attempt ${attemptIndex + 1} in ${Math.round(finalDelay)}ms`);
         return finalDelay;
       },
      // Connection-level event handlers
      onOpen: () => {
        console.log('✅ WebSocket connection established');
      },
             onClose: (cause) => {
         console.log('🔌 WebSocket connection closed:', cause?.code);
       },
      onError: (error) => {
        console.error('❌ WebSocket connection error:', error);
      },
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
