import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { EventType } from "utils/types";

export const useGetEventTypes = () => useQuery<EventType[], Error>({
  queryKey: ['eventTypes'],
  queryFn: async () => apiClient.get<EventType[]>('/event-types').then(res => res.data)
});