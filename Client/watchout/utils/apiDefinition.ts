export type ApiDefinition = {
  key: string[];
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export const apiDefinitions = {
  eventTypes: {
    key: ['eventTypes'],
    endpoint: '/event-types',
    method: 'GET' as const,
  },
  events: {
    key: ['events'],
    endpoint: '/events',
    method: 'GET' as const,
  },
  locations: {
    key: ['locations'],
    endpoint: '/locations',
    method: 'GET' as const,
  },
  users: {
    key: ['users'],
    endpoint: '/users',
    method: 'GET' as const,
  },
} satisfies Record<string, ApiDefinition>;
