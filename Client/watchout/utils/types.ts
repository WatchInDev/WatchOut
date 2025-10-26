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
  image: string;
  latitude: number;
  longitude: number;
  reportedDate: string;
  endDate: string;
  eventType: EventType;
  active: boolean;
};

export type CreateEventRequest = {
  name: string;
  description: string;
  image: string | null;
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
    name: string;
    lastname: string;
    reputation: number;
  };
  rating: number;
  ratingForCurrentUser: number;
};

export type AddCommentRequest = {
  eventId: number;
  content: string;
};

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