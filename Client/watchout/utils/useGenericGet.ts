import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import { ApiDefinition } from "./apiDefinition";

export const useQueryHook = <TData, TError = Error>({ key, endpoint }: ApiDefinition): UseQueryResult<TData, TError> => {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(endpoint);
      return data;
    },
  });
};