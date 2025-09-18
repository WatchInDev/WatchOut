import type { Coordinates } from './types';
export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

export const API_ENDPOINTS = {
  events: {
    get: ({ swLat, swLng, neLat, neLng }: Coordinates) => `events?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`,
    getClusters: ({ swLat, swLng, neLat, neLng }: Coordinates) => `events/clusters?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`
  },
  eventTypes: {
    getAll: 'event-types',
  }
};