import { useQueryHook } from 'utils/useQueryHook';
import {
  CoordinatesRect,
  CreateEventRequest,
  Event,
  EventCluster,
  GetEventsRequest,
} from 'utils/types';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';

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
  coordinates: CoordinatesRect;
  minPoints: number;
  eps: number;
};

export const useGetEventsClustered = (request: GetEventClustersRequest, isEnabled: boolean) =>
  useQueryHook<EventCluster[]>(
    [
      'events',
      request.coordinates.neLat.toFixed(1),
      request.coordinates.neLng.toFixed(1),
      'clustered',
    ],
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
