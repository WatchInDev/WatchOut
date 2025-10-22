import type { CoordinatesRect } from './types';

export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

const queryParams = (params: Record<string, string | number | boolean>) => {
  const esc = encodeURIComponent;
  return '?' + Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}

export const API_ENDPOINTS = {
  events: {
    get: (coordinates: CoordinatesRect) => `events${queryParams(coordinates)}`,
    getClusters: (coordinates: CoordinatesRect, minPoints: number, eps: number) => `events/clusters${queryParams(coordinates)}&minPoints=${minPoints}&eps=${eps}`,
    create: 'events',
  },
  comments: {
    getByEventId: (eventId: number) => `events/${eventId}/comments`,
    create: (eventId: number) => `events/${eventId}/comments`,
  },
  eventTypes: {
    getAll: 'event-types',
  }
};