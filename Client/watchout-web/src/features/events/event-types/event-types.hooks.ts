import type { EventType } from "@/types";
import { API_ENDPOINTS } from "@/utils/apiDefinition";
import { useQueryHook } from "@/utils/useQueryHook";

export const useGetEventTypes = () =>
  useQueryHook<EventType[], Error>(
    ["event-types"],
    API_ENDPOINTS.eventTypes.getAll
  );
