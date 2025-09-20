import type { Coordinates } from './types';

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
    get: (coordinates: Coordinates) => `events${queryParams(coordinates)}`,
    getClusters: (coordinates: Coordinates, gridCells: number) => `events/clusters${queryParams(coordinates)}&gridCells=${gridCells}`,
  },
  eventTypes: {
    getAll: 'event-types',
  }
};