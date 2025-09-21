import { useQueryHook } from "utils/useQueryHook";
import { Coordinates, Event, EventCluster } from "utils/types";
import { API_ENDPOINTS } from "utils/apiDefinition";

export const useGetEvents = (coordinates: Coordinates, isEnabled: boolean) => useQueryHook<Event[]>(
  ['events', JSON.stringify(coordinates)], API_ENDPOINTS.events.get(coordinates), isEnabled
);

export const useGetEventsClustered = (coordinates: Coordinates, gridCells: number, isEnabled: boolean) => useQueryHook<EventCluster[]>(
  ['events', JSON.stringify(coordinates), 'clustered', gridCells.toString()], 
  API_ENDPOINTS.events.getClusters(coordinates, gridCells),
  isEnabled
);