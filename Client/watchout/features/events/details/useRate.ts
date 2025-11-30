import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";

type RateEventParams = {
  eventId: string;
  isUpvote: boolean;
};

export const useRateEvent = (eventId: number) => useMutation({
  mutationKey: ['events', eventId, 'rate'],
  mutationFn: async (isUpvote: boolean) => apiClient.post<null, RateEventParams>(API_ENDPOINTS.rating.event(eventId), {
    rating: isUpvote ? 1 : -1
  }),
});