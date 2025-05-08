"use client";
import React from "react";
import { api } from "@/utils/api";
import type { RouterOutput } from "@/utils/api";

export type CurrentAudit = RouterOutput["audit"]["getCurrent"];

interface UseCurrentAuditOptions {
  enabled?: boolean;
  onSuccess?: (data: CurrentAudit) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook to fetch the latest audit for a client
 * @param clientId The client ID to fetch the current audit for
 * @param options Additional React Query options
 */
export function useCurrentAudit(
  clientId: string,
  options: UseCurrentAuditOptions = {}
) {
  const query = api.audit.getCurrent.useQuery(
    { clientId },
    { enabled: !!clientId && options.enabled !== false }
  );

  React.useEffect(() => {
    if (query.data && options.onSuccess) {
      options.onSuccess(query.data);
    }
  }, [query.data, options.onSuccess]);

  React.useEffect(() => {
    if (query.error && options.onError) {
      options.onError(query.error);
    }
  }, [query.error, options.onError]);

  return query;
} 