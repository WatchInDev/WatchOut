import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export const useQueryHook = <TData, TError = Error>(key: string[], endpoint: string, isEnabled: boolean = true): UseQueryResult<TData, TError> => {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(endpoint);
      return data;
    },
    enabled: isEnabled,
  });
};