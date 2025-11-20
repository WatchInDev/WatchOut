import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';

export const useOutages = () =>
  useQuery({
    queryKey: ['outages'],
    queryFn: () => apiClient.get(API_ENDPOINTS.externalWarnings.get).then((res) => res.data),
  });
