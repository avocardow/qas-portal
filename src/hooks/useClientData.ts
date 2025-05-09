import { api } from "@/utils/api";

export function useClientData(
  clientId: string,
  options?: Parameters<typeof api.clients.getById.useQuery>[1]
) {
  // Use a longer staleTime to reduce unnecessary refetches
  return api.clients.getById.useQuery(
    { clientId },
    { staleTime: 5 * 60 * 1000, ...options }
  );
} 