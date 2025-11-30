import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { UserPreferences } from 'utils/types';

export const useNotificationSettingsUpdate = () => {
  return useMutation({
    mutationFn: (settings: UserPreferences) =>
      apiClient.put(API_ENDPOINTS.preferences.update, settings),
  });
};
