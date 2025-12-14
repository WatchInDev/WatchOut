import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { Event } from 'utils/types';

export const useUserEvents = () =>
  useQuery({
    queryKey: ['events', 'user'],
    queryFn: async () => {
      const response = await apiClient.get<Event[]>(API_ENDPOINTS.events.getForUser);
      return response.data.sort(
        (a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()
      );
    },
  });
