import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/apiClient";
import { API_ENDPOINTS } from "utils/apiDefinition";

export const useCreateComment = () => useMutation({
  mutationFn: async ({ eventId, content }: { eventId: number; content: string }) => {
    return apiClient.post(API_ENDPOINTS.comments.post(eventId), { content });
  }
});