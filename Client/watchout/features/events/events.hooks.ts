import { useQueryHook } from 'utils/useQueryHook';
import {
  Event,
  EventCluster,
  GetEventsRequest,
} from 'utils/types';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { enlargeCoordinates, stringifyCoordinatesWithInterval } from 'utils/helpers';

export const useGetEvents = (request: GetEventsRequest, isEnabled: boolean) => {
  const enlargedCoordinates = enlargeCoordinates(request.coordinates, 0.1);
  const queryKey = [
    'events',
    stringifyCoordinatesWithInterval(enlargedCoordinates, 0.1),
    JSON.stringify(request),
  ];

  return useQuery<Event[]>({
    queryKey,
    queryFn: () =>
      apiClient.get<Event[]>(API_ENDPOINTS.events.get(request)).then((res) => res.data),
    enabled: isEnabled,
  });
};

type GetEventClustersRequest = {
  baseRequest: GetEventsRequest;
  minPoints: number;
  eps: number;
};

export const useGetEventsClustered = (request: GetEventClustersRequest, isEnabled: boolean) =>
  useQueryHook<EventCluster[]>(
    ['events', 'clustered', JSON.stringify(request)],
    API_ENDPOINTS.events.getClusters(request.baseRequest, request.minPoints, request.eps),
    isEnabled
  );
