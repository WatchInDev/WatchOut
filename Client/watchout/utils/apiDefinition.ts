import type { CoordinatesRect, GetEventsRequest, PaginationRequest } from './types';

export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

export const API_ENDPOINTS = {
  events: {
    get: (coordinates: GetEventsRequest) => `events${queryParams(coordinates)}`,
    getClusters: (coordinates: CoordinatesRect, minPoints: number, eps: number) =>
      `events/clusters${queryParams(coordinates)}&minPoints=${minPoints}&eps=${eps}`,
    create: 'events',
  },
  comments: {
    getByEventId: <T>(eventId: number, pagination: PaginationRequest<T>) =>
      `events/${eventId}/comments` + paginationToQueryParams(pagination),
    post: (eventId: number) => `events/${eventId}/comments`,
  },
  rating: {
    event: (eventId: number) => `events/${eventId}/ratings`,
  },
  eventTypes: {
    getAll: 'event-types',
  },
  locations: {
    getAll: 'users/favourite-places',
    add: 'users/favourite-places',
    delete: (placeId: string) => `users/favourite-places/${placeId}`,
  },
  externalWarnings: {
    get: 'external-warnings',
  },
  notifications: {
    add: 'fcm-tokens',
    get: 'fcm-tokens',
  },
};

// utility functions

const queryParams = (params: Record<string, any>) => {
  const esc = encodeURIComponent;
  return (
    '?' +
    Object.keys(params)
      .map((k) => {
        if (Array.isArray(params[k])) {
          return esc(k) + '=' + params[k].map((val: any) => `${esc(val)}`).join(',');
        }
        else if (params[k] instanceof Date) {
          return `${esc(k)}=${esc((params[k] as Date).toISOString().replace('Z', ''))}`;
        }
        else if (typeof params[k] === 'object' && params[k] !== null) {
          return queryParams(params[k]).slice(1);
        }
        return `${esc(k)}=${esc(params[k])}`;
      })
      .join('&')
  );
};

const paginationToQueryParams = <T>(pagination: PaginationRequest<T>) => {
  const params: Record<string, any> = {
    page: pagination.page,
    size: pagination.size,
  };

  if (pagination.sort) {
    params.sort = pagination.sort.map((s) => `${s.field.toString()},${s.direction}`);
  }

  return queryParams(params);
};
