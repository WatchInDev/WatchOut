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

export type EventCluster = {
  latitude: number;
  longitude: number;
  count: number;
}