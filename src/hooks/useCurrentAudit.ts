"use client";
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
  return api.audit.getCurrent.useQuery(
    { clientId },
    {
      enabled: !!clientId && options.enabled !== false,
      onSuccess: options.onSuccess,
      onError: options.onError,
    }
  );
} 