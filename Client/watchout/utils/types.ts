export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CoordinatesRect = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};

export type EventType = {
  id: number;
  name: string;
  description: string;
  icon: string;
};

export type Event = {
  id: number;
  name: string;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
  reportedDate: string;
  endDate: string;
  eventType: EventType;
  active: boolean;
  rating: number;
  ratingForCurrentUser: number;
};

export type Outage = {
  type: 'electrical_outage' | 'weather';
  location?: string;
  name?: string;
  description?: string;
  fromDate: Date;
  toDate: Date;
  provider?: string;
  locality?: string;
  placeName: string;
};

export type CreateEventRequest = {
  name: string;
  description: string;
  images: string[]; // base64 encoded images
  latitude: number;
  longitude: number;
  endDate: Date | string;
  eventTypeId: number;
};

export type EventCluster = {
  latitude: number;
  longitude: number;
  count: number;
};

export type Comment = {
  id: number;
  content: string;
  eventId: number;
  createdAt: Date;
  author: {
    id: number;
    reputation: number;
  };
  rating: number;
  ratingForCurrentUser: number;
};

export type AddCommentRequest = {
  eventId: number;
  content: string;
};

export type PinnedLocation = {
  id: number;
  placeName: string;
  latitude: number;
  longitude: number;
  location: string;
  locality: string;
  region: string;
  voivodeship: string;
  notificationsEnable: boolean;
  services: {
    electricity: boolean;
    weather: boolean;
  };
  radius: number;
};

export type AddLocationRequest = {
  placeName: string;
  latitude: number;
  longitude: number;
  settings: {
    radius: number;
    services: {
      electricity: boolean;
      weather: boolean;
      eventTypes?: number[];
    };
  };
  notificationsEnable: boolean;
};

export type UpdateLocationRequest = AddLocationRequest;

export type PaginationRequest<T> = {
  page: number;
  size: number;
  sort?: SortCriteria<T>[];
};

export type SortCriteria<T> = {
  field: keyof T;
  direction: 'asc' | 'desc';
};

export type Page<T> = {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    unpaged: boolean;
  };
  empty: boolean;
};

export type EventFilters = {
  hoursSinceReport: number;
  eventTypesIds: number[];
};

export type GetEventsRequest = {
  coordinates: CoordinatesRect;
  eventTypeIds?: number[];
  reportedDateFrom?: Date;
  reportedDateTo?: Date;
  distance?: number;
  rating?: number;
};

export type GetEventClusteredRequest = {
  coordinates: CoordinatesRect;
  eventTypeIds?: number[];
  reportedDateFrom?: Date;
  reportedDateTo?: Date;
};

export type UserPreferences = {
  notifyOnEvent: boolean;
  notifyOnComment: boolean;
  notifyOnExternalWarning: boolean;
};

export type Alert = {
  type: 'electrical_outage' | 'weather';
  location?: string;
  name?: string;
  description?: string;
  fromDate: Date;
  toDate: Date;
  provider?: string;
  locality?: string;
  placeName: string;
};
