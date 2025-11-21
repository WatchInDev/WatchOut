import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";

export const useLocationDelete = () => useMutation({
  mutationKey: ['location', 'delete'],
  mutationFn: async (locationId: number) =>
    apiClient.delete<void>(API_ENDPOINTS.locations.delete(locationId.toString())),
});