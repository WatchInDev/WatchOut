import type { GetEventsRequest, PaginationRequest } from './types';

export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

export const API_ENDPOINTS = {
  events: {
    get: (request: GetEventsRequest) => `events${queryParams(request)}`,
    getClusters: (request: GetEventsRequest, minPoints: number, eps: number) =>
      `events/clusters${queryParams(request)}&minPoints=${minPoints}&eps=${eps}`,
    create: 'events',
    availability: 'events/ability',
  },
  comments: {
    getByEventId: <T>(eventId: number, pagination: PaginationRequest<T>) =>
      `events/${eventId}/comments` + paginationToQueryParams(pagination),
    post: (eventId: number) => `events/${eventId}/comments`,
    delete: (eventId: number, commentId: number) => `events/${eventId}/comments/${commentId}`,
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
    edit: (placeId: string) => `users/favourite-places/${placeId}`,
    delete: (placeId: string) => `users/favourite-places/${placeId}`,
  },
  externalWarnings: {
    get: 'external-warnings',
  },
  preferences: {
    get: 'users/preferences',
    update: 'users/preferences',
  },
  notifications: {
    add: 'fcm-tokens',
    get: 'fcm-tokens',
  },
  users: {
    create: 'users/create',
  }
};

// utility functions

function queryParams(params: Record<string, any>): string {
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

function paginationToQueryParams<T>(pagination: PaginationRequest<T>) {
  const params: Record<string, any> = {
    page: pagination.page,
    size: pagination.size,
  };

  if (pagination.sort) {
    params.sort = pagination.sort.map((s) => `${s.field.toString()},${s.direction}`);
  }

  return queryParams(params);
};
