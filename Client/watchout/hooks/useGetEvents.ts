import { apiDefinitions } from "utils/apiDefinition";
import { useQueryHook } from "utils/useGenericGet";
import { Event } from "utils/types";

export const useGetEvents = () => useQueryHook<Event[]>(apiDefinitions.events);