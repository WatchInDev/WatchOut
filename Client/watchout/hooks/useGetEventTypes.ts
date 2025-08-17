import { apiDefinitions } from "utils/apiDefinition";
import { EventType } from "utils/types";
import { useQueryHook } from "utils/useGenericGet";

export const useGetEventTypes = () => useQueryHook<EventType[], Error>(apiDefinitions.eventTypes);