import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';

export const useEventDeactivate = () =>
  useMutation({
    mutationKey: ['deactivateEvent'],
    mutationFn: (eventId: number) =>
      apiClient.patch(API_ENDPOINTS.events.deactivate(eventId)).then((res) => res.data),
  });
