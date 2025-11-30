import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { Alert } from 'utils/types';

export const useAlerts = () =>
  useQuery({
    queryKey: ['alerts'],
    queryFn: () =>
      apiClient.get<Alert[]>(API_ENDPOINTS.externalWarnings.get).then((res) => res.data),
  });
