import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";
import { UserPreferences } from "utils/types";

export const useNotificationSettings = () => useQuery({
  queryKey: ['notificationSettings'],
  queryFn: () => apiClient.get<UserPreferences>(API_ENDPOINTS.preferences.get).then(res => res.data),
})