import { api } from "@/utils/api";

export function useLifetimeData(clientId: string) {
  const { data, isLoading, isError, error } = api.clients.getLifetimeData.useQuery(
    { clientId }
  );
  return { data, isLoading, isError, error };
} 