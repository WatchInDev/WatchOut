import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";
import { AddLocationRequest } from "utils/types";

export const useLocationCreate = () => useMutation({
  mutationKey: ['createLocation'],
  mutationFn: async (newLocation: AddLocationRequest) =>
    apiClient.post<void>(API_ENDPOINTS.locations.add, newLocation),
});