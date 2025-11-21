import { useQueryHook } from '../../utils/useQueryHook';
import type { CoordinatesRect, CreateEventRequest, Event, EventCluster } from '../../utils/types';
import { API_ENDPOINTS } from '../../utils/apiDefinition';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';

const roundToInterval = (value: number, interval: number): number => {
  if (interval <= 0) return value;
  
  return Math.round(value / interval) * interval;
};

const enlargeCoordinates = (coordinates: CoordinatesRect, margin: number): CoordinatesRect => {
  return {
    neLat: coordinates.neLat + margin,
    neLng: coordinates.neLng + margin,
    swLat: coordinates.swLat - margin,
    swLng: coordinates.swLng - margin,
  };
};

const roundCoordinates = (coordinates: CoordinatesRect, interval: number): CoordinatesRect => {
  return {
    neLat: roundToInterval(coordinates.neLat, interval),
    neLng: roundToInterval(coordinates.neLng, interval),
    swLat: roundToInterval(coordinates.swLat, interval),
    swLng: roundToInterval(coordinates.swLng, interval),
  };
};

const stringifyCoordinatesWithInterval = (coordinates: CoordinatesRect, interval: number) => {
    const { neLat, neLng, swLat, swLng } = roundCoordinates(coordinates, interval);
    return `${neLat},${neLng},${swLat},${swLng}`;
};

export const useGetEvents = (coordinates: CoordinatesRect, isEnabled: boolean) => {
  const enlargedCoordinates = enlargeCoordinates(coordinates, 0.05);

  return useQueryHook<Event[]>(
    ['events', stringifyCoordinatesWithInterval(enlargedCoordinates, 0.05)],
    API_ENDPOINTS.events.get(enlargedCoordinates),
    isEnabled
  );
}
  
type GetEventClustersRequest = {
  coordinates: CoordinatesRect;
  minPoints: number;
  eps: number;
}

export const useGetEventsClustered = (request: GetEventClustersRequest, isEnabled: boolean) =>
  useQueryHook<EventCluster[]>(
    ['events', request.coordinates.neLat.toFixed(1), request.coordinates.neLng.toFixed(1), 'clustered'],
    API_ENDPOINTS.events.getClusters(request.coordinates, request.minPoints, request.eps),
    isEnabled
  );

export const useCreateEvent = () =>
  useMutation({
    mutationKey: ['createEvent'],
    mutationFn: async (request: CreateEventRequest) => {
      return apiClient.post<Event>(API_ENDPOINTS.events.create, request).then((res) => res.data);
    },
  });
