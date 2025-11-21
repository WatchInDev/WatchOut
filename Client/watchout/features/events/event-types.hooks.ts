import { API_ENDPOINTS } from "utils/apiDefinition";
import { EventType } from "utils/types";
import { useQueryHook } from "utils/useQueryHook";

export const useGetEventTypes = () => useQueryHook<EventType[], Error>(['event-types'], API_ENDPOINTS.eventTypes.getAll);