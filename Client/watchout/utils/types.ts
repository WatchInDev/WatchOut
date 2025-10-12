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
