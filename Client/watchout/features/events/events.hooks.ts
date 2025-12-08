import { useQueryHook } from 'utils/useQueryHook';
import { Event, EventCluster, GetEventsRequest } from 'utils/types';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import {
  enlargeCoordinates,
  roundCoordinates,
  stringifyCoordinatesWithInterval,
} from 'utils/helpers';

export const useGetEvents = (request: GetEventsRequest, isEnabled: boolean) => {
  const enlargedCoordinates = roundCoordinates(enlargeCoordinates(request.coordinates, 0.3), 0.1);
  request = {
    ...request,
    coordinates: enlargedCoordinates,
  };

  const queryKey = [
    'events',
    stringifyCoordinatesWithInterval(request.coordinates, 0.3),
    JSON.stringify({ ...request }),
  ];

  return useQuery<Event[]>({
    queryKey,
    queryFn: () =>
      apiClient.get<Event[]>(API_ENDPOINTS.events.get(request)).then((res) => res.data),
    staleTime: 10 * 1000,
    enabled: isEnabled,
  });
};

type GetEventClustersRequest = {
  baseRequest: GetEventsRequest;
  minPoints: number;
  eps: number;
};

export const useGetEventsClustered = (request: GetEventClustersRequest, isEnabled: boolean) => {
  const enlargedCoordinates = roundCoordinates(
    enlargeCoordinates(request.baseRequest.coordinates, 0.5),
    0.5
  );
  request = {
    ...request,
    baseRequest: {
      ...request.baseRequest,
      coordinates: enlargedCoordinates,
    },
  };

  const queryKey = ['events', 'clustered', JSON.stringify(request)];

  return useQuery<EventCluster[]>({
    queryKey,
    queryFn: () =>
      apiClient
        .get<
          EventCluster[]
        >(API_ENDPOINTS.events.getClusters(request.baseRequest, request.minPoints, request.eps))
        .then((res) => res.data),
    enabled: isEnabled,
    staleTime: 20 * 1000,
  });
};
