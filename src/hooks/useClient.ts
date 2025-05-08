// A custom React hook for fetching client data via tRPC
"use client";

import { api } from "@/utils/api";
import type { RouterOutput } from "@/utils/api";

/**
 * ClientData type inferred from tRPC router output for getById.
 */
export type ClientData = RouterOutput["clients"]["getById"];

/**
 * Options for the useClient hook.
 */
interface UseClientOptions {
  /** Enable or disable the query */
  enabled?: boolean;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: ClientData) => void;
  /** Callback when an error occurs during fetching */
  onError?: (error: unknown) => void;
}

/**
 * Hook to fetch client data by ID.
 * @param id The client ID to fetch; if undefined, query is disabled.
 * @param options Additional query options and callbacks.
 * @returns The react-query result for the client data.
 */
export function useClient(
  id: string | undefined,
  options: UseClientOptions = {}
) {
  return api.clients.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: !!id && options.enabled !== false,
      onSuccess: options.onSuccess,
      onError: options.onError,
    }
  );
} 