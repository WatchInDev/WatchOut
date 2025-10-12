import { useQueryHook } from 'utils/useQueryHook';
import { CoordinatesRect, CreateEventRequest, Event, EventCluster } from 'utils/types';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';

export const useGetEvents = (coordinates: CoordinatesRect, isEnabled: boolean) =>
  useQueryHook<Event[]>(
    ['events', JSON.stringify(coordinates)],
    API_ENDPOINTS.events.get(coordinates),
    isEnabled
  );

export const useGetEventsClustered = (coordinates: CoordinatesRect, isEnabled: boolean) =>
  useQueryHook<EventCluster[]>(
    ['events', JSON.stringify(coordinates), 'clustered'],
    API_ENDPOINTS.events.getClusters(coordinates, 1, 0.02),
    isEnabled
  );

export const useCreateEvent = () =>
  useMutation({
    mutationKey: ['createEvent'],
    mutationFn: async (request: CreateEventRequest) => {
      return apiClient.post<Event>(API_ENDPOINTS.events.create, request).then((res) => res.data);
    },
  });
