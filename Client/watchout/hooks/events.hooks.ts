import { useQueryHook } from "utils/useQueryHook";
import { Coordinates, Event, EventCluster } from "utils/types";
import { API_ENDPOINTS } from "utils/apiDefinition";

export const useGetEvents = (coordinates: Coordinates) => useQueryHook<Event[]>(
  ['events', JSON.stringify(coordinates)], API_ENDPOINTS.events.get(coordinates)
);

export const useGetEventsClustered = (coordinates: Coordinates) => useQueryHook<EventCluster[]>(
  ['events', JSON.stringify(coordinates), 'clustered'], 
  API_ENDPOINTS.events.getClusters(coordinates)
);