import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { ActionAvailabilityRequest, ActionAvailabilityResponse } from 'utils/types';

export const useActionAvailability = (
  request: ActionAvailabilityRequest,
  { isEnabled }: { isEnabled: boolean }
) =>
  useQuery({
    queryKey: ['actionAvailability', request],
    queryFn: () =>
      apiClient
        .get<ActionAvailabilityResponse>(API_ENDPOINTS.events.availability(request))
        .then((res) => res.data),
    enabled: isEnabled,
  });
