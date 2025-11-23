import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { CreateEventRequest } from 'utils/types';

export const useCreateEvent = () =>
  useMutation({
    mutationKey: ['createEvent'],
    mutationFn: async (request: CreateEventRequest) => {
      return apiClient.post<Event>(API_ENDPOINTS.events.create, request).then((res) => res.data);
    },
  });
