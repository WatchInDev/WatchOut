import type { CoordinatesRect, PaginationRequest } from './types';

export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

export const API_ENDPOINTS = {
  events: {
    get: (coordinates: CoordinatesRect) => `events${queryParams(coordinates)}`,
    getClusters: (coordinates: CoordinatesRect, minPoints: number, eps: number) => `events/clusters${queryParams(coordinates)}&minPoints=${minPoints}&eps=${eps}`,
    create: 'events',
  },
  comments: {
    getByEventId: <T>(eventId: number, pagination: PaginationRequest<T>) => `events/${eventId}/comments` + paginationToQueryParams(pagination),
    post: (eventId: number) => `events/${eventId}/comments`,
  },
  eventTypes: {
    getAll: 'event-types',
  },
  notifications: {
    add: 'fcm-tokens',
    get: 'fcm-tokens',
  }
};

// utility functions

const queryParams = (params: Record<string, any>) => {
  const esc = encodeURIComponent;
  return '?' + Object.keys(params)
    .map(k => {
      if (Array.isArray(params[k])) {
        return params[k].map((val: any) => `${esc(k)}=${esc(val)}`).join('&');
      }
      return `${esc(k)}=${esc(params[k])}`;
    })
    .join('&');
}

const paginationToQueryParams = <T>(pagination: PaginationRequest<T>) => {
  const params: Record<string, any> = {
    page: pagination.page,
    size: pagination.size,
  };

  if (pagination.sort) {
    params.sort = pagination.sort.map(s => `${s.field.toString()},${s.direction}`);
  }

  return queryParams(params);
}