import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";

type AddTokenRequest = {
  tokenFCM: string;
};

export const useTokenAdd = () => useMutation({
  mutationKey: ['notifications', 'add'],
  mutationFn: (token: AddTokenRequest) => apiClient.post(API_ENDPOINTS.notifications.add, token)
});