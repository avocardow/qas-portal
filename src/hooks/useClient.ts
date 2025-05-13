// A custom React hook for fetching client data via tRPC
"use client";

import { api } from "@/utils/api";
import type { RouterOutput } from "@/utils/api";
import React from "react";

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
  const { enabled = true, onSuccess, onError } = options;
  // Execute the tRPC query with destructured enabled flag
  const query = api.clients.getById.useQuery(
    { clientId: id ?? "" },
    { enabled: !!id && enabled }
  );

  // Invoke onSuccess callback when data is fetched
  React.useEffect(() => {
    if (query.data && onSuccess) {
      onSuccess(query.data);
    }
  }, [query.data, onSuccess]);

  // Invoke onError callback on error
  React.useEffect(() => {
    if (query.error && onError) {
      onError(query.error);
    }
  }, [query.error, onError]);

  return query;
} 