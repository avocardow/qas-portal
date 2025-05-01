import { api } from "@/utils/api";

export function useClientData(clientId: string) {
  const { data, isLoading, isError, error } = api.clients.getById.useQuery({ clientId });
  return { data, isLoading, isError, error };
} 