import { useQueryHook } from "utils/useQueryHook";
import { Event, EventCluster } from "utils/types";
import { API_ENDPOINTS } from "utils/apiDefinition";

export const useGetEvents = () => useQueryHook<Event[]>([], API_ENDPOINTS.events.getClusters);

export const useGetEventsClustered = ({ swLat, swLng, neLat, neLng }: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}) => useQueryHook<EventCluster[]>(['eventsClustered'], API_ENDPOINTS.events.clusters({ swLat, swLng, neLat, neLng }));
