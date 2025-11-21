import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { PinnedLocation } from 'utils/types';

export const usePinnedLocations = () =>
  useQuery({
    queryKey: ['pinnedLocations'],
    queryFn: async () =>
      apiClient.get<PinnedLocation[]>(API_ENDPOINTS.locations.getAll).then((res) => res.data),
  });
