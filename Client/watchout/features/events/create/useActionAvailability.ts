import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";
import { ActionAvailability } from "utils/types";

export const useActionAvailability = () => useQuery({
  queryKey: ['actionAvailability'],
  queryFn: () => apiClient.get<ActionAvailability>(API_ENDPOINTS.events.availability).then(res => res.data)
});